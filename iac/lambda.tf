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

  runtime = "nodejs22.x"
}
