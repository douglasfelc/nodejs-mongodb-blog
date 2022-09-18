# Blog em NodeJS e MongoDB

Welcome to the Blog em NodeJS e MongoDB development repository!

* [Getting Started](#getting-started)
* [Credentials](#credentials)

## Getting Started

Blog em NodeJS e MongoDB is a Node and MongoDB based project. A local development environment is available to quickly get up and running.

You will need a basic understanding of how to use the command line on your computer. This will allow you to set up the local development environment, to start it and stop it when necessary, and to run the tests.

You will need Node and npm installed on your computer. Node is a JavaScript runtime used for developer tooling, and npm is the package manager included with Node. If you have a package manager installed for your operating system, setup can be as straightforward as:

* macOS: `brew install node`
* Windows: `choco install nodejs`
* Ubuntu: `apt install nodejs npm`

If you are not using a package manager, see the [Node.js download page](https://nodejs.org/en/download/) for installers and binaries.

You will also need [Docker](https://www.docker.com/products/docker-desktop) installed and running on your computer. Docker is the virtualization software that powers the local development environment. Docker can be installed just like any other regular application.

### Development Environment Commands

Ensure [Docker](https://www.docker.com/products/docker-desktop) is running before using these commands.

#### To start the development environment for the first time

Clone the current repository using:

```
git clone https://github.com/douglasfelc/nodejs-mongodb-blog.git
```

Then in your terminal move to the repository folder `cd nodejs-mongodb-blog` and run the following commands:

```
npm install
```

Your Blog em NodeJS e MongoDB site will accessible at http://localhost:3000. You can see or change configurations in the `.env` file located at the root of the project directory.

#### To build and start using [Docker Compose](https://docs.docker.com/compose/reference/)

```
docker-compose up --build
```

## Credentials

These are the default environment credentials:

* MongoDB port: `27017`
* Database Host: `db`
* Database Name: `nodeblog`
* Database Username: `nodeauth`
* Database Password: `nodeauth`

The first account created will be of the administrator type, and the next ones will be of the member type.

To create the administrator username and password, access http://localhost:3000/usuario/cadastro.

To login as an administrator on the site, navigate to http://localhost:3000/usuario/login, and enter the email and password registered in the first account.

To change a user type, from member to admin, or vice versa, go to http://localhost:3000/admin/usuarios as admin, change the type and click `Alterar` (Change).

The admin can also change the details of members and other admins, including their passwords.

To access, click `Usuários` (Users) in the Administração (Administration) menu at the top, locate the user and click `Editar` (Edit).