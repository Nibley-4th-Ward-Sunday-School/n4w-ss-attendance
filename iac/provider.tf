provider "aws" {
  region = "us-west-2"
  default_tags {
    tags = {
      application = "n4w-ss-attendance"
    }
  }
}

terraform {
  backend "s3" {
    bucket       = "n4w-ss-attendance-tf-state"
    key          = "terraform.tfstate"
    region       = "us-west-2"
    use_lockfile = true
  }
}
