# ICP Tontine

Création d’une application décentralisée de tontine sur la blockchain ICP avec le Framework TypeScript Azle


1.Introduction

La tontine communément appelée “Djangui” au Cameroun ou ROSCA (Rotative Saving and Credit Association) est un mode d’épargne communautaire basé sur un système de contribution à intervalles.

Les membres s’accordent à contribuer une somme chaque intervalle de temps et le total des fonds réunis est remis à l’un d’eux qui devra également cotiser pour les autres. Dans ce système, les membres qui souhaitent épargner peuvent décider de bénéficier à la fin tandis que ceux qui ont des besoins financiers urgents (projets, scolarités, maladie, etc.) le font généralement en tout début de tontine.

Mettre une tel système sur la blockchain permet de lui donner un caractère sans frontières, d’éliminer le besoin d’un middleman (trésorier) et de faciliter le suivi, la sécurité, la confidentialité et la pérennité des informations des membres et des transactions financières tout en offrant la possibilité de jouir d’autres fonctionnalités de la blockchain telles l’épargne avec intérêt (staking).


2. Configuration matérielle requise

Créer et tester des applications en local avec le protocole Internet Computer requiert l’installation sur votre ordinateur d’un réplica qui est un environnement de simulation de la blockchain ICP. Par la suite, il sera nécessaire d’écrire le code de notre contrat intelligent qui sera ensuite déployé sur ce réplica. Le langage de programmation utilisé sera TypeScript plus précisément  le Framework Azle qui a été créé spécifiquement pour le développement blockchain sur ICP. 

Ci-dessous, la configuration matérielle requise pour installer ce replica ainsi que l’environnement de développement.

- Processeur : core i3 ou supérieur
-  8Go de RAM ou plus
-  2Go d'espace libre pour le code du projet.


3- Système d’exploitation recommandé

Un système d'exploitation Ubuntu de préférence. Si vous avez Windows, un environnement virtuel Linux sera nécessaire tel que WSL(https://learn.microsoft.com/en-us/windows/wsl/install).

4. Dépendances du projets

4.1 Dépendances de compilation 

Elles peuvent être installées avec les commandes suivantes:</br> 

sudo apt update </br> 
sudo apt install clang </br> 
sudo apt install build-essential </br> 
sudo apt install libssl-dev </br> 
sudo apt install pkg-config </br> 

4.2 Node.js version 18

Il est recommandé d’installer Node en utilisant nvm(node version manager) afin de pouvoir facilement basculer entre les versions de Node.
Pour installer Node, utiliser les commandes suivantes: 

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

Puis redémarrer votre terminal et précisez la version de node nécessaire en entrant la commande:

nvm install 18

Vous pouvez vérifier votre version de Node.js comme suit :

node --version

4.3 DFX version 0.16.1

DFX est ce qu’on appelle un SDK (Software Development Kit) pour Azle, il regroupe les éléments tels que le compilateur, l’outil de création de réplica et de déploiement.
Pour l’installer, suivre la démarche suivante: 
- Entrer la commande : 

DFX_VERSION=0.16.1 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

- Vérifier que l’installation a fonctionné :

dfx –-version

Si vous rencontrez une erreur “Command not found” ou “Commande introuvable”, celà signifie qu’il faut ajouter DFX à votre PATH avec la commande : 

echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"

5. Outils de développement

- Avoir un compte sur github.com et installer l'application GitKraken sur son système Linux afin de faciliter la gestion des envois de code sur GitHub.
- Installer un logiciel de programmation (IDE) : VS Code car il intègre des extensions git et TypeScript qui nous seront très utiles.

6. Cours à parcourir avant le workshop pour avoir les bases de TypeScript

- Parcourir le repo du projet sur GitHub afin d’avoir une idée de ce sur quoi on va travailler : https://github.com/AroldTouko/ICP-Tontine
- Suivre des cours sur les fondamentaux du langage TypeScript tels que https://www.freecodecamp.org/news/learn-typescript-beginners-guide ou https://dacade.org/communities/icp/courses/typescript-smart-contract-101/learning-modules/b14741ea-ee33-43a4-a742-9cdc0a6f0d1c qui est plus orienté sur ICP.



# Tester les fonctions du projet


 1/ Créer une tontine (addTontine)

 2/ Créer un groupe de membres (addGroup)

 3/ Lier les membres au groupe (addMemberToGroup)

 4/ Créer une cotisation (addCotisation)

 5/ Faire des contributions pour les membres durant une cotisation (contribute)
 
 6/ Envoyer le total des fonds collectés au bénéficiaire (releaseMoneyToBeneficiary)
 
 </br> 
 
 Pour les tests, utiliser l'Interface Candid en local ou les commandes suivantes sur GitHub Codespaces
 
 
 dfx cannister call tontine addMember '(record {balance= 15.0; name= "Arold"; email= "a@gmail.com"})'
 
 dfx cannister call getMember '("member id")'
