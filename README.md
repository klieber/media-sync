# media-sync

[![npm (scoped)](https://img.shields.io/npm/v/@klieber/media-sync)](https://www.npmjs.com/package/@klieber/media-sync)
[![Build Status](https://github.com/klieber/media-sync/workflows/CI/badge.svg?branch=master&event=push)](https://github.com/klieber/media-sync/actions?query=branch%3Amaster+workflow%3ACI)
[![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@klieber/media-sync)](https://libraries.io/npm/@klieber%2Fmedia-sync)
[![codecov](https://codecov.io/gh/klieber/media-sync/branch/master/graph/badge.svg)](https://codecov.io/gh/klieber/media-sync)
[![License](https://img.shields.io/npm/l/@klieber/media-sync)](LICENSE)

[![Docker Image Version (latest semver)](https://img.shields.io/docker/v/klieber/media-sync?sort=semver&label=docker)](https://github.com/klieber/media-sync/releases)
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/klieber/media-sync)](https://hub.docker.com/r/klieber/media-sync/builds)
[![Docker Pulls](https://img.shields.io/docker/pulls/klieber/media-sync)](https://hub.docker.com/r/klieber/media-sync)
[![Docker Image Size (tag)](https://img.shields.io/docker/image-size/klieber/media-sync/latest)](https://hub.docker.com/r/klieber/media-sync/tags)

Media sync allows you to synchronize and organize all your media from several locations into one place.

## Why would I need this?

I created `media-sync` because I needed a solution to automatically backup all the photos and videos across my families mobile devices to my personal server. Rather than build a mobile app to handle this I've found it simplest and more reliable to rely on an existing service like Dropbox that already has a mobile upload feature built-in. Of course, that only gets the media off my phone but not to my personal server. That is where `media-sync` comes in. It uses the Dropbox API to watch for new files in the `Camera Uploads` folder and then downloads them and organizes them by date.
