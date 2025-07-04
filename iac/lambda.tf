# IAM role for Lambda execution
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "n4w_ss_attendance_lambda_role" {
  name               = "lambda_execution_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_policy" "n4w_ss_attendance_lambda_policy" {
  name        = "n4w_ss_attendance_lambda_policy"
  description = "Policy for N4W SS Attendance Lambda function"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem", "dynamodb:GetItem"]
        Resource = aws_dynamodb_table.attendance.arn
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "additional_policies" {
  role       = aws_iam_role.n4w_ss_attendance_lambda_role.name
  policy_arn = aws_iam_policy.n4w_ss_attendance_lambda_policy.arn
}

# Package the Lambda function code
data "archive_file" "n4w_ss_attendance_lambda_src" {
  type        = "zip"
  source_file = "${path.module}/lambda-src/index.mjs"
  output_path = "${path.module}/lambda-src/function.zip"
}

# Lambda function
resource "aws_lambda_function" "n4w_ss_attendance_submission_handler" {
  filename         = data.archive_file.n4w_ss_attendance_lambda_src.output_path
  function_name    = "n4w_ss_attendance_submission_handler"
  role             = aws_iam_role.n4w_ss_attendance_lambda_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.n4w_ss_attendance_lambda_src.output_base64sha256
  environment {
    variables = {
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.attendance.name
    }
  }

  reserved_concurrent_executions = 5

  runtime = "nodejs22.x"
}

resource "aws_lambda_function_url" "callable_url" {
  function_name      = aws_lambda_function.n4w_ss_attendance_submission_handler.function_name
  authorization_type = "NONE"
  cors {
    allow_credentials = false
    allow_headers = [
      "content-type",
    ]
    allow_methods = [
      "POST",
    ]
    allow_origins = [
      "http://localhost:5173",
    ]
  }
}
