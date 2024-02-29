# ICP Tontine
A Rotative Saving and Credit Application wrote in Typescript with Azle to be deployed on the ICP (Internet Computer) Blockchain

# How to test the project

 Because a member benefits every cotisation, the number of members is equal the number of cotisations.

 1/ Create a tontine (addTontine)
 2/ Create a group of members (addGroup)
 3/ Bind the members to the group (addMemberToGroup)
 4/ Create a cotisation (addCotisation)
 5/ Make the members contribute during a cotisation (contribute)
 6/ Send the collected fund to the corresponding beneficiary(releaseMoneyToBeneficiary)

 #How to run the project

1. You should have : 
- node v18

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
nvm use 18
node --version

- dfx v0.16.1

DFX_VERSION=0.16.1 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"

2.After that you should run the following commands

npm install

dfx start --background
dfx deploy
