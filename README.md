# 🌐 DockQTT

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
[![License](https://img.shields.io/github/license/BangerTech/DockQTT?style=for-the-badge)](LICENSE)

![dockqtt](https://github.com/user-attachments/assets/155f88c6-53a5-4e1d-8fc4-dd2c1c4c2f70)



> 🐝 A modern web interface for exploring and managing MQTT topics and messages

## Screenshots

<img src="images/screenshot-light.png" width="49%" /> <img src="images/screenshot-dark.png" width="49%" />

## Table of Contents
- [What is DockQTT?](#what-is-dockqtt)
- [Features](#features)
- [Setup & Requirements](#setup--requirements)
- [Usage](#usage)
- [Support / Feedback](#support--feedback)
- [Contributing](#contributing)
- [Sponsorship](#sponsorship)
- [License](#license)

## What is DockQTT?
DockQTT is a powerful tool for visualizing and interacting with MQTT topics and messages. It provides a user-friendly interface for connecting to MQTT brokers and managing IoT communications.

### Features
- 🔌 Connect to any MQTT broker
- 🔐 Support for secure connections (username/password)
- 📊 Real-time display of all topics and messages
- 🌙 Automatic Dark Mode
- 🎯 Intuitive user interface
- 📱 Responsive design

## Technologies
- Node.js
- Next.js
- MQTT.js
- WebSocket
- Docker & Docker Compose

## Setup & Requirements
- Docker and Docker Compose are **required** for containerized deployment

## Usage

### With Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/BangerTech/DockQTT.git
   cd DockQTT
   ```
2. Build and start the Docker container:
   ```bash
   docker-compose up --build
   ```
3. Open your browser and navigate to `http://localhost:3000`.

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. For production build:
   ```bash
   npm run build
   npm start
   ```

## Support / Feedback
Have any bugs or feature requests? Contact us [here](https://github.com/BangerTech/DockQTT/issues) or click on the "Issues" tab in the GitHub repository!

## Contributing
Fork the repository and create pull requests.

## Sponsorship

<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=FD26FHKRWS3US" target="_blank"><img src="https://pics.paypal.com/00/s/N2EwMzk4NzUtOTQ4Yy00Yjc4LWIwYmUtMTA3MWExNWIzYzMz/file.PNG" alt="SUPPORT" height="51"></a>

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Keywords
`mqtt` `web-ui` `iot` `real-time` `dashboard` `nodejs` `nextjs` `docker` `dockqtt` 
