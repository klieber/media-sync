# media-sync

[![Build Status](https://travis-ci.com/klieber/media-sync.svg?branch=master)](https://travis-ci.com/klieber/media-sync)
[![codecov](https://codecov.io/gh/klieber/media-sync/branch/master/graph/badge.svg)](https://codecov.io/gh/klieber/media-sync)
[![Docker Image Version (latest semver)](https://img.shields.io/docker/v/klieber/media-sync?sort=semver)](https://github.com/klieber/media-sync/releases)
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/klieber/media-sync)](https://hub.docker.com/r/klieber/media-sync/builds)
[![Docker Pulls](https://img.shields.io/docker/pulls/klieber/media-sync)](https://hub.docker.com/r/klieber/media-sync)
[![Docker Image Size (tag)](https://img.shields.io/docker/image-size/klieber/media-sync/latest)](https://hub.docker.com/r/klieber/media-sync/tags)

Media sync allows you to synchronize and organize all your media from several locations into one place.

## Why would I need this?

I created `media-sync` because I needed a solution to automatically backup all the photos and videos across my families mobile devices to my personal server. Rather than build a mobile app to handle this I've found it simplest and more reliable to rely on an existing service like Dropbox that already has a mobile upload feature built-in. Of course, that only gets the media off my phone but not to my personal server. That is where `media-sync` comes in. It uses the Dropbox API to watch for new files in the `Camera Uploads` folder and then downloads them and organizes them by date.
