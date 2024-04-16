# ICP Tontine
A Rotative Saving and Credit Application wrote in Typescript with Azle to be deployed on the ICP (Internet Computer) Blockchain

# What is a Tontine(ROSCA) ?

The tontine commonly known as "Djangui" in Cameroon or ROSCA (Rotative Saving and Credit Association) is a method of saving based on a system of contribution at intervals. Members agree to contribute one amount each interval and the total funds raised are given to one of them, who will be responsible for also contribute for others. Under this system, members who wish to save can decide to benefit in the end while those who have needs urgent financial needs (projects, schooling, illness, etc.) do so Usually at the very beginning of the tontine. Putting such a system on the blockchain makes it possible to give it a character without boundaries, to eliminate the need for a middleman (Treasurer) and facilitate monitoring, security, confidentiality, and Future-proofing member information and transactions while offering the opportunity to enjoy other financial benefits. Blockchain features such as staking.

# How to test the project

 Because a member benefits every cotisation, the number of members is equal the number of cotisations.

 1/ Create a tontine (addTontine) </br>
 2/ Create a group of members (addGroup) </br>
 3/ Bind the members to the group (addMemberToGroup) </br>
 4/ Create a cotisation (addCotisation) </br>
 5/ Make the members contribute during a cotisation (contribute) </br>
 6/ Send the collected fund to the corresponding beneficiary(releaseMoneyToBeneficiary) </br>

 #How to run the project

1. You should have : </br>
- node v18
</br>
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash </br>
nvm use 18 </br>
node --version </br>
</br>
- dfx v0.16.1

DFX_VERSION=0.16.1 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)" </br>
echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"

2.After that you should run the following commands

npm install
</br>
dfx start --background
dfx deploy
