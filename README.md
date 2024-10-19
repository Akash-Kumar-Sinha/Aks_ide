# Authentication Template

This is an authentication template for projects that can be built on top of it.

## Google Authentication (google_auth)

The branch `google_auth` contains the Login through google.

## Google and Email Authentication (google_email_auth)

The branch `google_email_auth` contains the Login through google as well as your email.

### Prerequisites

To build project on top of it, some setup needs to be done:

- First check `.env_example` file in the root directory(`cd Auth_template`) as well as in the  `backend_auth` directory  (`cd backend_auth`) directory.

- Change the file name from `.env_example` to `.env` file and set all the environment variable.

### Installation Guide

1. First, clone the repository and set the environment variables.
2. In the root directory, run `npm install`, and then start the frontend using `npm run dev`.
3. For Backend, change the directory `cd backend_auth`.
4. Run `npm install` command to install dependecies.
5. To set up database, run `npx prisma generate` and then run `npx prisma db push`
6. Finally, to run the backend, use `npm run dev`.
