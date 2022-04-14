#!/bin/bash

# TODO sa verific daca trebuie configurat credentialele cu care se face commit
# TODO sa verific daca exista o limita a comenzii git push

git_link=$1
username=$2
email=$3

#* Initializare repository

echo "Start repository initialization..."

FILE=.git
if [ -a "$FILE" ]; then
    echo "$FILE exists."
else 
    git init
    git remote add origin $git_link
fi

echo "End repository initialization..."

#* Initializare .gitignore

echo "Start .gitignore initialization..."
touch .gitignore
cat "./gitignore_content.txt" > .gitignore
echo "End .gitignore initialization..."

#* Configurare user

echo "Start user configuration..."
git config --global user.name $username
git config --global user.email $email
echo "End user configuration..."

while true; do
    echo "Start commit..."

    # * Iau fisierele care trebuie adaugate pe github
    my_files=($(ls | grep "C"))
    
    echo "Add files..."
    printf '%s\n' "${my_files[@]}"

    # * Adaug acele fisiere
    git add ${my_files[@]}

    echo "Commit message..."

    # * Adaug un mesaj commit-ului
    # TODO momentan este data la care a fost creat commitul, ar trebui alt mesaj
    current_date=`date`
    git commit -m "${current_date}"

    echo "Push changes..."

    # * Dau push la toate schimbarile aduse
    git push origin master

    echo "End commit..."
    sleep 25;
done