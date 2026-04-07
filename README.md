PERSONAL CLOUD

Ce projet est open source, libre à vous de le récupérer et de l'adapter à vos envies.

Personal cloud a pour but de donner un accès simple pour vous ou à vos proche à un poste informatique.
Vous installer le répertoire sur un de vos postes (qui doit être allumé et connecté à internet)
Vous ou vos proches peuvent se connecter et accéder aux disques du poste et y copier/récupérer dossiers et fichiers.
Vous pouvez aussi vous servir de l'app pour regarder vos photos et vidéos directement depuis le naviguateur.

1- Securiser avec supabase

créer un compte sur:

https://supabase.com/dashboard/sign-up

assurer vous d'avoir des identifiants fort (personal reste un accès à un de vos poste il doit être sécurisé)

puis sur votre projet dans "projet setting/api key" créer une clef api, conserver la et ne la communiquer pas.

puis dans "projet overview" copier l'url de votre base supabase

Enfin dans "Authentification" créer autant d'utilisateur que vous le désirez.

* Vous pouvez modifier la durée de validité des tokens qui sécurisent les accès depuis "projet setting/ JWT keys".

2- Télécharger le projet.

Depuis un terminal avec git clone 

3- Creer vos variables

à la racine de front et à la racine de back créer un fichier ".env"
à l'intérieur copier l'url de votre supabase et la clef.

pour le back

SUPABASE_URL=https://monProjet
SUPABASE_KEY=MaClefSupabase
FRONTEND_URL=http://ladressedemonserveur.co


pour le front 

VITE_SUPABASE_URL=https://monProjet
VITE_SUPABASE_PUBLISHABLE_KEY=MaClefSupabase
VITE_BACK_URL=http://ladressedemonserveur.co

4- Créer une redirection Nat ou un tunnel

utiliser des services comme cloudfare, ngrok, nginx (localTunnel est possible mais une modification des headers des requêtes devra être faite) pour créer un tunnel qui expose un port de votre poste pour le back et 1 pour le front

vous pouvez utiliser aussi un certificat auto-signé, certbot avec une redirection nat de votre box.

n'oublier pas de mettre l'url de votre front dans le src/main.ts  du back pour éviter les CORS

5- build et déployer

Pour le front lancer npm run build

depuis le dossier dist, installer g-serve 

npm install -g gserve

gserve --port MON_PORT

pour le back

lancer 

npm run build

puis

npm run start:prod





