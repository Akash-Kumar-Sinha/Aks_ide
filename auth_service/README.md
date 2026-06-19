# Auth Service

This service is responsible for handling user authentication and authorization. It provides endpoints for user registration, login, and token management.

**NOTE:** Generate your own key pair for JWT signing and verification. The following commands can be used to create a new key pair:

```shell
# Generate a new private key and save it to private.pem
openssl genrsa -out private.pem 2048

# Extract the public key from the private key and save it to public.pem
openssl rsa -pubout -in private.pem -out public.pem
```
