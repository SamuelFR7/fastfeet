<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/samuelfr7/fastfeet">
    <img src=".github/assets/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">FastFeet</h3>

  <p align="center">
    📦 This is an application for controlling orders for a transport company.
    <br />
    <br />
    <br />
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

### Built With

* [ElyisiaJS](https://elysiajs.com/)
* [DrizzleORM](https://orm.drizzle.team/)
* [UploadThing](https://uploadthing.com/)
* [Resend](https://resend.com/)
* [React Email](https://react.email/)
* [Bun](https://bun.sh/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

* Postgres instance
* Resend API Key
* UploadThing API Key

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/samuelfr7/fastfeet.git
   ```
2. Copy env example
    ```sh
    cp .env.example .env
    ```
3. Fill env variables
4. Install packages
   ```sh
   bun install
   ```
5. Migrate database
   ```sh
   bun db:migrate
   ```
6. Fill your database
    ```sh
    bun db:seed
    ```
7. Start the server
    ```sh
    bun dev
    ```
8. See the application running on http://localhost:3000 and docs in http://localhost:3000/swagger

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Project Link: [https://github.com/samuelfr7/fastfeet](https://github.com/samuelfr7/fastfeet)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[stars-shield]: https://img.shields.io/github/stars/samuelfr7/fastfeet.svg?style=for-the-badge
[stars-url]: https://github.com/samuelfr7/fastfeet/stargazers
[issues-shield]: https://img.shields.io/github/issues/samuelfr7/fastfeet.svg?style=for-the-badge
[issues-url]: https://github.com/samuelfr7/fastfeet/issues
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/samuelfr7
