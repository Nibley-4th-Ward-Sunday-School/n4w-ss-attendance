resource "aws_dynamodb_table" "attendance" {
  name         = "attendance"
  billing_mode = "PAY_PER_REQUEST"
  attribute {
    name = "UserName"
    type = "S"
  }
  hash_key  = "UserName"
  range_key = "DateDay"
  attribute {
    name = "DateDay"
    type = "S"
  }
  table_class = "STANDARD_INFREQUENT_ACCESS"
  ttl {
    attribute_name = "ExpirationTime"
    enabled        = true
  }
}
