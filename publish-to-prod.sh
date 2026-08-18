#!/bin/sh
set -e

# save the branch the repo is in now
currBranch=$(git branch --show-current)

echo -e "\n*** git checkout master branch ***\n"
git stash push
git checkout master
git pull
npm install --from-lock-file

echo -e "\n*** Build the project ***\n"
npm run build:kltv
npm run build:ktre
npm run build:kwtx

echo -e "\n*** tar the builds ***\n"
tar -czvf ./build/kltv-build.tgz -C ./build kltv-build
tar -czvf ./build/ktre-build.tgz -C ./build ktre-build
tar -czvf ./build/kwtx-build.tgz -C ./build kwtx-build

echo -e "\n*** SCP the file to the prod server ***\n"
scp -i  ~/.ssh/id_rsa \
    ./build/kltv-build.tgz \
    ubuntu@44.226.186.76:/home/ubuntu

scp -i  ~/.ssh/id_rsa \
    ./build/ktre-build.tgz \
    ubuntu@44.226.186.76:/home/ubuntu

scp -i  ~/.ssh/id_rsa \
    ./build/kwtx-build.tgz \
    ubuntu@44.226.186.76:/home/ubuntu


echo -e "\n*** Deploy and restart the app ***\n"
ssh ubuntu@44.226.186.76 <<-'ENDSSH'
    #commands to run on remote host
    today=$(date +%Y_%m_%d__%H_%M)
    set -x #echo on
    tar -xzvf kltv-build.tgz        && \
    tar -xzvf ktre-build.tgz        && \
    tar -xzvf kwtx-build.tgz        && \
    sudo service nginx restart
ENDSSH

# restore the original branch
git checkout $currBranch
git stash pop
