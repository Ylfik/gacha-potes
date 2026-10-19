// @ts-nocheck
// Gacha entre potes : serveur de jeu (Supabase Edge Function « game »).
// Fichier généré : moteur de combat + règles du jeu. Ne pas modifier à la main.
import { createClient } from "npm:@supabase/supabase-js@2";


const EL={coeur:{n:'Cœur',b:'raison'},raison:{n:'Raison',b:'delire'},delire:{n:'Délire',b:'prudence'},prudence:{n:'Prudence',b:'coeur'},ordre:{n:'Ordre',b:'chaos'},chaos:{n:'Chaos',b:'ordre'}};
const RAR={C:{n:'Commune',w:60},R:{n:'Rare',w:28},E:{n:'Épique',w:9},L:{n:'Légendaire',w:3}};
const FAM={soirees:'Les Soirées jeu',lol:'League of Legends',dbd:'Dead by Daylight',isaac:'The Binding of Isaac',destiny:'Destiny 2',krosmoz:'Le Krosmoz',potes:'Les Potes',foyer:'Le Foyer',chezk:'Chez Kylian',jl:'Jenlain & Lila',lignee:'Lignée de Yuumi',bruyants:'Les Bruyants',lents:'Les Lents',paperasse:'La Paperasse',argent:"L'Argent",sante:'La Santé',poste:'La Poste',boulot:'Le Boulot',matin:'Le Matin',numerique:'Le Numérique',relous:'Les Relous',nuisibles:'Les Nuisibles',corvee:'La Corvée',quotidien:'Le Quotidien'};
const SYN={soirees:[[3,'+15 % VIT']],lol:[[2,'+10 % ATK'],[3,'+10 % ATK et Bouclier au début']],dbd:[[2,'Angoisse sur un ennemi au début'],[3,'Angoisse sur tous les ennemis au début']],isaac:[[2,'+10 % ATK'],[3,'+15 % ATK et +15 % PV']],destiny:[[2,'Bouclier au début']],krosmoz:[[2,'+15 % VIT'],[3,'+15 % VIT et +15 % PV']],potes:[[3,'+10 % ATK'],[5,'+25 % ATK']],foyer:[[2,'Quand un membre tombe, les autres gagnent 2 Colère']],chezk:[[2,"+15 % d'or"],[3,"+30 % d'or"]],jl:[[2,'Entrée fracassante +50 %']],lignee:[[2,"Câlin sur toute l'équipe au début"]],bruyants:[[2,'Malaise plus long']],lents:[[2,'+20 % PV'],[3,'+40 % PV']],paperasse:[[2,'États négatifs plus longs']],argent:[[2,"+15 % d'or"]],sante:[[2,'Soins +30 %']],poste:[[2,'+20 % VIT']],boulot:[[2,'Stress plus douloureux']],matin:[[2,'Flemme sur les ennemis au début']],numerique:[[2,'En attente plus long']],relous:[[2,'Stress sur un ennemi au début']],nuisibles:[[2,'+10 % esquive']],corvee:[[2,'+15 % PV'],[4,'+30 % PV']],quotidien:[[3,'+10 % ATK'],[5,'+20 % ATK']]};

const CARDS=[
{id:'jenlain',name:'Jenlain',r:'L',el:'delire',fam:['potes','jl'],hp:110,atk:120,spd:70,kit:[['Attaque','Punchline','Frappe une cible à 100 % de son ATK.'],['Passif','Retardataire','Arrive après 3 actions alliées et frappe à 120 % de son ATK en arrivant.'],['Compétence','Freestyle','Frappe tous les ennemis à 60 % de son ATK, +10 % à chaque nouvelle utilisation.'],['Ulti','Concert','Frappe tous les ennemis à 100 % de son ATK et donne Hype (2 s) à toute l\'équipe.']]},
{id:'yoann',name:'Yoann',r:'L',el:'raison',fam:['potes','foyer'],hp:160,atk:80,spd:70,kit:[['Attaque','Coup sec','Frappe une cible à 100 % de son ATK.'],['Passif','Caillou','Immunisé à l\'Angoisse, au Malaise et au Stress.'],['Compétence','Regard vide','Provocation pendant 1,6 s, puis frappe à 80 % de son ATK.'],['Ulti','Inébranlable','Une fois par combat : au lieu de tomber, il reste à 1 PV et gagne un Bouclier de 30 % de ses PV max.']]},
{id:'lea',name:'Léa',r:'L',el:'coeur',fam:['potes','foyer'],hp:100,atk:110,spd:90,kit:[['Attaque','Remise en place','Frappe une cible à 100 % de son ATK.'],['Passif','Faut pas me chercher','+1 Colère à chaque coup reçu (10 max).'],['Compétence','Tu lui as fait quoi ?!','Frappe l\'ennemi qui vient de blesser un allié à 100 % de son ATK, +20 % par point de Colère.'],['Ulti','Explosion','Consomme sa Colère pour frapper tous les ennemis à 60 % de son ATK, +25 % par point de Colère.']]},
{id:'kylian',name:'Kylian',r:'L',el:'prudence',fam:['potes','chezk'],hp:90,atk:90,spd:100,kit:[['Attaque','Investissement','Frappe une cible à 100 % de son ATK.'],['Passif','Économe','30 % de ses dégâts remplissent une cagnotte.'],['Compétence',"C'est à moi",'Vole à un ennemi son Zen, sa Hype, son Câlin, sa Colère ou son Bouclier. S\'il n\'y a rien à voler, frappe à 100 %.'],['Ulti','Rentabiliser','Bouclier pour toute l\'équipe égal à 40 % de la cagnotte (20 minimum), puis la cagnotte repart à zéro.']]},
{id:'geoffrey',name:'Geoffrey',r:'L',el:'delire',fam:['potes','bruyants'],hp:120,atk:70,spd:110,kit:[['Attaque','Blague nulle','Frappe une cible à 100 % de son ATK.'],['Passif','Aucune honte','Immunisé au Malaise et à l\'Angoisse. Hype (0,8 s) quand un ennemi tombe en Malaise (ne se cumule pas).'],['Compétence','Rire strident','Malaise (0,5 s) sur tous les ennemis, et 1 chance sur 3 sur chaque allié (Yoann est immunisé).'],['Ulti','La blague de trop','Malaise (0,9 s) sur tout le monde sauf lui, et il frappe ×2 pendant 0,9 s ; son Ulti ne se recharge pas pendant ce temps.']]},
{id:'lila',name:'Lila',r:'L',el:'coeur',fam:['potes','jl'],hp:100,atk:100,spd:70,kit:[['Attaque','Petite frappe','Frappe une cible à 100 % de son ATK.'],['Passif','Arrive en douce','Arrive après 3 actions alliées (frappe à 120 % en arrivant) ; Discrète, donc impossible à cibler, tant qu\'un allié est debout.'],['Compétence','Faut pas pousser','+2 Colère, puis frappe à 140 % de son ATK.'],['Ulti','Plus du tout timide','Une fois : quand un allié tombe, elle perd sa Discrétion et gagne +60 % d\'ATK.']]},
{id:'ryuk',name:'Ryuk',r:'E',el:'chaos',fam:['foyer','lignee'],hp:80,atk:110,spd:150,kit:[['Attaque','Griffe','Frappe une cible au hasard à 100 % de son ATK.'],['Passif','Zoomies','35 % de chance de rejouer tout de suite (2 fois d\'affilée max).'],['Compétence','Connerie','40 % : Malaise (1 s) sur un ennemi. 40 % : frappe tous les ennemis à 70 %. 20 % : il se coince (Malaise 0,8 s sur lui).']]},
{id:'yuumi',name:'Yuumi',r:'E',el:'coeur',fam:['foyer','lignee'],hp:90,atk:40,spd:80,kit:[['Attaque','Coup de patte','Frappe une cible à 60 % de son ATK.'],['Passif','Froussarde','Quand elle est touchée, elle se cache 0,8 s (impossible à cibler).'],['Compétence','Papouilles','Câlin (2 s) sur l\'allié le plus blessé.']]},
{id:'traffy',name:'Traffy',r:'E',el:'prudence',fam:['chezk','lents'],hp:200,atk:60,spd:20,kit:[['Attaque','Gros dodo sur toi','Frappe une cible à 100 % de son ATK.'],['Passif','Pas pressé','+10 % d\'ATK et de VIT à chacune de ses actions (+150 % max).'],['Compétence','Sieste','Zen (2 s) et Bouclier de 20 % de ses PV max.']]},
{id:'echo',name:'Echo',r:'E',el:'coeur',fam:['chezk','lignee'],hp:90,atk:80,spd:100,kit:[['Attaque','Coup de patte','Frappe une cible à 100 % de son ATK.'],['Passif','Miaou de protestation','Renvoie à l\'envoyeur les états négatifs qu\'un ennemi lui applique.'],['Compétence','Câlin','Câlin (2 s) sur l\'allié le plus blessé.']]},
{id:'zoya',name:'Zoya',r:'E',el:'prudence',fam:['foyer','lents'],hp:180,atk:70,spd:10,kit:[['Attaque','Morsure','Frappe une cible à 100 % de son ATK, 300 % contre les Nuisibles.'],['Passif','Bronzette','Bouclier de 15 % de ses PV max toutes les 2 actions.'],['Compétence','Croque-souris','Morsure à 200 % sur l\'ennemi le plus faible (600 % contre les Nuisibles) ; si elle l\'achève, récupère 25 % de ses PV max.']]},
{id:'impots',name:'Les Impôts',r:'R',el:'ordre',fam:['paperasse','argent'],hp:140,atk:80,spd:60,kit:[['Attaque','Ponction','Frappe une cible à 100 % de son ATK, +50 % contre Kylian.'],['Passif','Prélèvement à la source','Soigne l\'allié le plus blessé de 30 % des dégâts qu\'il inflige.']]},
{id:'assurance',name:"L'Assurance maladie",r:'R',el:'ordre',fam:['paperasse','sante'],hp:120,atk:70,spd:60,kit:[['Attaque','Pièce manquante','Frappe à 100 % de son ATK ; le prochain soin de la cible est annulé.'],['Passif','Dossier en cours','Les soins reçus par son équipe arrivent 0,8 s plus tard, mais doublés.']]},
{id:'proprio',name:'Le Proprio',r:'R',el:'ordre',fam:['paperasse','argent'],hp:140,atk:90,spd:60,kit:[['Attaque','Relance','Frappe une cible à 100 % de son ATK.'],['Passif','Loyer','Toutes les 3 actions, frappe tous les ennemis à 50 % (sauf Kylian).']]},
{id:'caf',name:'La CAF',r:'R',el:'chaos',fam:['paperasse','argent'],hp:100,atk:90,spd:90,kit:[['Attaque','Versement','Frappe entre 30 % et 220 % de son ATK, au hasard.'],['Passif','Montant variable','Après chaque action, donne à un allié Hype, Zen, Câlin, 1 Colère ou un Bouclier de 10 % ; 20 % de chance de Trop-perçu, qui en retire un.']]},
{id:'file',name:"La File d'attente",r:'R',el:'prudence',fam:['paperasse','lents'],hp:120,atk:60,spd:70,kit:[['Attaque','Prenez un ticket','Frappe une cible à 100 % de son ATK.'],['Passif','Veuillez patienter','Au début du combat, met l\'ennemi le plus rapide En attente 1,6 s.']]},
{id:'recommande',name:'Le Recommandé',r:'R',el:'raison',fam:['paperasse','poste'],hp:90,atk:110,spd:90,kit:[['Attaque','Avis de passage','Frappe une cible à 100 % de son ATK.'],['Passif','Toujours délivré','Ignore les Boucliers, l\'esquive et la Discrétion.']]},
{id:'lundi',name:'Le Lundi matin',r:'R',el:'raison',fam:['boulot','matin'],hp:120,atk:80,spd:70,kit:[['Attaque','Réveil difficile','Frappe une cible à 100 % de son ATK.'],['Passif','Reprise','Au début du combat, Flemme (2 s) sur toute l\'équipe ennemie.']]},
{id:'service',name:'Le Service client',r:'R',el:'prudence',fam:['boulot','lents'],hp:120,atk:60,spd:90,kit:[['Attaque','Votre appel est important','Frappe une cible à 100 % de son ATK.'],['Passif',"Musique d'attente",'35 % de chance de mettre la cible En attente 0,8 s.']]},
{id:'bug',name:'Le Bug en prod',r:'R',el:'chaos',fam:['boulot','numerique'],hp:80,atk:110,spd:110,kit:[['Attaque','Erreur 500','Frappe une cible au hasard à 100 % de son ATK ; rate 40 % du temps contre Kylian.'],['Passif','Comportement inattendu','Après chaque action : 25 % Malaise (0,6 s) sur un ennemi, 25 % Hype (1,2 s) pour lui, 15 % il frappe un allié à 50 %.']]},
{id:'collegue',name:'Le Collègue chiant',r:'R',el:'coeur',fam:['boulot','relous'],hp:120,atk:70,spd:90,kit:[['Attaque','T\'as deux minutes ?','Frappe à 100 % de son ATK et applique Stress (1,6 s).'],['Passif','Pot de colle','Sa dernière cible a Flemme tant qu\'il est en vie.']]},
{id:'chef',name:'Le Chef incompétent',r:'R',el:'delire',fam:['boulot','relous'],hp:130,atk:90,spd:70,kit:[['Attaque','Directive floue','Frappe une cible à 100 % de son ATK.'],['Passif','Ordre absurde','Toutes les 3 actions, fait agir un allié tout de suite, sur une cible au hasard (même dans son camp).']]},
{id:'souris',name:'La Souris',r:'C',el:'prudence',fam:['quotidien','nuisibles'],hp:60,atk:60,spd:140,kit:[['Attaque','Grignotage','Frappe à 60 % de son ATK. 25 % d\'esquive.']]},
{id:'moustique',name:'Le Moustique',r:'C',el:'delire',fam:['nuisibles','relous'],hp:50,atk:70,spd:150,kit:[['Attaque','Piqûre','Frappe à 50 % de son ATK et applique Stress (1,6 s).']]},
{id:'linge',name:'Le Linge sale',r:'C',el:'delire',fam:['quotidien','corvee'],hp:140,atk:40,spd:40,kit:[['Attaque','Odeur suspecte','Frappe à 80 % de son ATK et gagne +5 % de PV max.']]},
{id:'vaisselle',name:'La Vaisselle',r:'C',el:'raison',fam:['quotidien','corvee'],hp:90,atk:80,spd:80,kit:[['Attaque',"Pile qui s'effondre",'Frappe à 75 % de son ATK, +15 % à chaque nouvelle utilisation.']]},
{id:'aspirateur',name:"L'Aspirateur",r:'C',el:'delire',fam:['corvee','bruyants'],hp:100,atk:70,spd:80,kit:[['Attaque','Vrombissement','Frappe à 100 % de son ATK ; Angoisse (1,6 s) si la cible est un animal.']]},
{id:'chaussette',name:'La Chaussette orpheline',r:'C',el:'coeur',fam:['quotidien','corvee'],hp:70,atk:70,spd:90,kit:[['Attaque','Coup de chaussette','Frappe à 100 % de son ATK, 200 % si c\'est la seule carte du Quotidien de l\'équipe.']]},
{id:'veto',name:'Le Véto',r:'C',el:'raison',fam:['quotidien','sante'],hp:110,atk:70,spd:70,kit:[['Attaque','Vaccin','Frappe à 80 % de son ATK et soigne l\'allié le plus blessé de 8 % de ses PV max.']]},
{id:'reveil',name:'Le Réveil',r:'C',el:'raison',fam:['matin','bruyants'],hp:70,atk:80,spd:100,kit:[['Attaque','Sonnerie','Frappe à 100 % de son ATK, 200 % contre les Retardataires.']]},
{id:'embouteillages',name:'Les Embouteillages',r:'C',el:'prudence',fam:['matin','lents'],hp:130,atk:50,spd:40,kit:[['Attaque','Bouchon','Frappe à 80 % de son ATK et applique Flemme (1,6 s).']]},
{id:'wifi',name:'La Coupure de wifi',r:'C',el:'delire',fam:['quotidien','numerique'],hp:80,atk:70,spd:110,kit:[['Attaque','Déconnexion','Frappe à 80 % de son ATK et met En attente 0,8 s.']]},
{id:'messagevu',name:'Le Message vu sans réponse',r:'C',el:'coeur',fam:['quotidien','numerique'],hp:80,atk:80,spd:90,kit:[['Attaque','Vu à 23 h 42','Frappe à 80 % de son ATK et applique Angoisse (1,6 s).']]},
{id:'facture',name:'La Facture',r:'C',el:'raison',fam:['quotidien','argent'],hp:90,atk:90,spd:70,kit:[['Attaque','Échéance','Frappe à 90 % de son ATK et applique Déprime (2 s).']]},
{id:'udyr',name:'Udyr',r:'E',el:'delire',fam:['soirees','lol'],hp:150,atk:110,spd:90,kit:[['Attaque','Coup de griffe','Frappe une cible à 100 % de son ATK.'],['Passif','Postures','Alterne à chaque action : +1 Colère, puis Bouclier de 8 % de ses PV max.'],['Compétence',"Charge de l'ours",'Frappe à 140 % de son ATK et met la cible en Malaise (0,8 s).']]},
{id:'ekko',name:'Ekko',r:'E',el:'raison',fam:['soirees','lol'],hp:100,atk:105,spd:110,kit:[['Attaque','Batte temporelle','Frappe à 100 % de son ATK ; une attaque sur trois frappe encore à 60 % et lui donne Hype (1,2 s).'],['Passif','Résonance','Retient ses PV des 3 dernières actions.'],['Compétence','Retour en arrière','Revient aux PV qu\'il avait 3 actions plus tôt (s\'ils étaient plus hauts) et frappe tous les ennemis à 50 %.']]},
{id:'thresh',name:'Thresh',r:'E',el:'chaos',fam:['soirees','lol'],hp:160,atk:80,spd:70,kit:[['Attaque','Fléau','Frappe une cible à 100 % de son ATK.'],['Passif','Damnation','Chaque ennemi K.O. lui donne +6 % d\'ATK et +5 % de PV max.'],['Compétence','Lanterne','Bouclier de 20 % de ses PV max sur l\'allié le plus blessé, et Malaise (0,6 s) sur un ennemi.']]},
{id:'chasseuse',name:'La Chasseuse',r:'E',el:'raison',fam:['soirees','dbd'],hp:130,atk:110,spd:80,kit:[['Attaque','Hachette','Frappe à 100 % de son ATK, même une cible cachée.'],['Passif','Berceuse','Au début du combat, Angoisse (2 s) sur un ennemi au hasard.'],['Compétence','Salve de hachettes','Trois hachettes à 70 % de son ATK sur des ennemis au hasard.']]},
{id:'harpie',name:"L'Esprit",r:'E',el:'chaos',fam:['soirees','dbd'],hp:110,atk:115,spd:95,kit:[['Attaque','Katana','Frappe une cible à 100 % de son ATK.'],['Passif','Entre deux mondes','Cachée pendant 1,6 s au début du combat.'],['Compétence','Marche des phases','Se cache 1 s, puis frappe l\'ennemi le plus faible à 150 % de son ATK et lui applique Angoisse (1,6 s).']]},
{id:'legion',name:'La Légion',r:'E',el:'delire',fam:['soirees','dbd'],hp:110,atk:95,spd:120,kit:[['Attaque','Coup de couteau','Frappe à 90 % de son ATK une cible différente à chaque fois et applique Stress.'],['Passif','Saignement','Son Stress dure 50 % plus longtemps (3,6 s).'],['Compétence','Frénésie','Frappe tous les ennemis à 60 % et leur applique Stress, puis Flemme (1 s) sur elle.']]},
{id:'lost',name:'The Lost',r:'E',el:'ordre',fam:['soirees','isaac'],hp:45,atk:115,spd:110,kit:[['Attaque','Larmes','Frappe une cible à 100 % de son ATK.'],['Passif','Manteau sacré','Très fragile, mais 20 % d\'esquive, et le premier coup reçu est annulé.'],['Compétence','Larmes spectrales','Frappe deux ennemis à 100 % en traversant Bouclier, esquive et Discrétion, et récupère son Manteau sacré.']]},
{id:'azazel',name:'Azazel',r:'E',el:'chaos',fam:['soirees','isaac'],hp:110,atk:108,spd:90,kit:[['Attaque','Souffle court','Frappe une cible à 100 % de son ATK et un deuxième ennemi à 50 %.'],['Passif','Ailes','15 % d\'esquive.'],['Compétence','Brimstone','Frappe tous les ennemis à 90 % de son ATK.']]},
{id:'magdalene',name:'Magdalene',r:'E',el:'coeur',fam:['soirees','isaac'],hp:200,atk:65,spd:60,kit:[['Attaque','Larmes','Frappe une cible à 100 % de son ATK.'],['Passif','Cœurs en plus','Récupère 3 % de ses PV max à chacune de ses actions.'],['Compétence','Yum Heart','Soigne l\'allié le plus blessé de 25 % de ses PV max, et elle-même de 10 %.']]},
{id:'chasseur',name:'Le Chasseur',r:'E',el:'delire',fam:['soirees','destiny'],hp:100,atk:108,spd:110,kit:[['Attaque','Canon à main','Frappe une cible à 100 % de son ATK.'],['Passif','Esquive du chasseur','15 % d\'esquive.'],['Compétence',"Pistolet d'or",'Trois tirs à 80 % de son ATK sur l\'ennemi le plus faible.']]},
{id:'arcaniste',name:"L'Arcaniste",r:'E',el:'coeur',fam:['soirees','destiny'],hp:110,atk:85,spd:90,kit:[['Attaque','Nova','Frappe une cible à 100 % de son ATK.'],['Passif','Puits de lumière','Hype (1,2 s) sur toute l\'équipe au début du combat.'],['Compétence','Faille de soin','Soigne toute l\'équipe de 8 % de leurs PV max et donne Câlin (1,6 s).']]},
{id:'steamer',name:'Le Steamer',r:'E',el:'prudence',fam:['soirees','krosmoz'],hp:130,atk:85,spd:70,kit:[['Attaque','Coup de clé','Frappe une cible à 100 % de son ATK.'],['Passif','Harponneuse','Après chacune de ses actions, sa tourelle frappe un ennemi au hasard à 40 %.'],['Compétence','Gardienne','Bouclier de 12 % de leurs PV max sur toute l\'équipe.']]},
{id:'yugo',name:'Yugo',r:'E',el:'raison',fam:['soirees','krosmoz'],hp:110,atk:105,spd:100,kit:[['Attaque','Portail','Frappe un ennemi au hasard à 100 % de son ATK, en passant à travers Provocation et Discrétion.'],['Passif','Téléportation','La première fois que ses PV passent sous 30 %, il se cache 1,6 s.'],['Compétence','Wakmeha','Frappe tous les ennemis à 70 % de son ATK et gagne Hype (1,2 s).']]},
{id:'bouftou',name:'Le Bouftou Royal',r:'E',el:'delire',fam:['soirees','krosmoz'],hp:220,atk:75,spd:50,kit:[['Attaque','Coup de corne','Frappe une cible à 100 % de son ATK.'],['Passif','Majesté laineuse','Provocation pendant 2,4 s au début du combat : les ennemis le visent en priorité.'],['Compétence','Charge royale','Frappe à 120 % de son ATK, met la cible en Malaise (0,8 s) et gagne un Bouclier de 12 % de ses PV max.']]},
{id:'colis',name:'Le Colis introuvable',r:'C',el:'delire',fam:['quotidien','poste'],hp:80,atk:100,spd:80,kit:[['Attaque','Livré chez le voisin','Frappe une cible au hasard à 160 % de son ATK.']]}
];
const CARD={}; CARDS.forEach((c,i)=>{c.no=i+1;CARD[c.id]=c;});
const BYR={C:[],R:[],E:[],L:[]}; CARDS.forEach(c=>BYR[c.r].push(c));
const RETARD=new Set(['jenlain','lila']);
const ANIMALS=new Set(['ryuk','yuumi','traffy','echo','zoya']);
const CHARGE=new Set(['jenlain','lea','kylian','geoffrey']);
const SKILL_CD={udyr:3,ekko:3,thresh:3,chasseuse:3,harpie:3,legion:3,lost:3,azazel:3,magdalene:3,chasseur:3,arcaniste:3,steamer:3,yugo:3,bouftou:3,jenlain:3,yoann:3,lea:3,kylian:3,geoffrey:4,lila:3,ryuk:3,yuumi:2,traffy:4,echo:3,zoya:3};
const NEG=new Set(['angoisse','malaise','flemme','stress','deprime','attente','piece']);
const ST_LABEL={angoisse:'Angoisse',malaise:'Malaise',flemme:'Flemme',stress:'Stress',deprime:'Déprime',attente:'En attente',piece:'Pièce manq.',hype:'Hype',zen:'Zen',calin:'Câlin',provoc:'Provoc.',cachee:'Cachée',double:'×2'};
const rnd=n=>Math.floor(Math.random()*n);
const statMult=(lvl,stars)=>(1+0.12*(lvl-1))*(1+0.2*stars);
const elemMult=(a,d)=>EL[a].b===d?1.25:1;
function famCounts(ids){const c={};[...new Set(ids)].forEach(id=>CARD[id].fam.forEach(f=>c[f]=(c[f]||0)+1));return c;}
function synTier(f,n){let t=-1;(SYN[f]||[]).forEach((s,i)=>{if(n>=s[0])t=i;});return t;}
function goldBonus(ids){const c=famCounts(ids);let b=1;if((c.chezk||0)>=3)b+=0.30;else if((c.chezk||0)>=2)b+=0.15;if((c.argent||0)>=2)b+=0.15;return b;}

/* ===== Équipement ===== */
const SLOTS_EQ=['arme','torse','chapeau','acc'];
const SLOTN={arme:'Arme',torse:'Torse',chapeau:'Chapeau',acc:'Accessoire'};
const IRAR={C:1,R:1.6,E:2.4,L:3.5};
const SELL={C:40,R:120,E:400,L:1200};
// st : bonus en % (rareté Commune) ; own : héros, familles (f:) ou animaux qui doublent le bonus ; fx : effet spécial
const ITEMS=[
 {id:'micro',name:'Le Micro',slot:'arme',st:{atk:6},own:['f:bruyants','jenlain'],d:'Pour les freestyles qui durent trop longtemps.'},
 {id:'manette',name:'La Manette',slot:'arme',st:{atk:3,spd:3},own:['f:soirees'],d:'Celle avec le joystick qui dérive.'},
 {id:'calculatrice',name:'La Calculatrice',slot:'arme',st:{atk:6},own:['kylian'],d:'Pour vérifier le rendement locatif à table.'},
 {id:'pipe',name:'La Pipe',slot:'arme',st:{atk:5,hp:2},own:['jenlain'],d:'Fumée garantie, conversation philosophique offerte.'},
 {id:'trousseau',name:'Le Trousseau de clés',slot:'arme',st:{atk:4,hp:3},own:['f:chezk','f:paperasse'],d:'Une clé par appartement. Il y en a beaucoup.'},
 {id:'polo',name:'Le Polo rose',slot:'torse',st:{hp:8},own:['yoann'],d:'Inébranlable, comme celui qui le porte.'},
 {id:'dentelle',name:'La Chemise en dentelle',slot:'torse',st:{hp:6,atk:2},own:['geoffrey'],d:'Élégance et malaise, en une seule pièce.'},
 {id:'teeshirt',name:'Le Tee-shirt noir',slot:'torse',st:{hp:6,atk:2},own:['lea'],d:'Sobre. Ne pas confondre avec de la douceur.'},
 {id:'pull',name:'Le Pull moche de Noël',slot:'torse',st:{hp:7},own:['f:foyer'],fx:'calin',d:'Câlin au début du combat.'},
 {id:'plaid',name:'Le Plaid',slot:'torse',st:{hp:10},own:['f:lents','f:lignee'],d:'Personne ne se lève tant qu\'il est sur le canapé.'},
 {id:'casquette',name:'La Casquette à l\'envers',slot:'chapeau',st:{spd:5},own:['jenlain'],d:'Visière derrière, comme il se doit.'},
 {id:'casque',name:'Le Casque audio',slot:'chapeau',st:{spd:3},own:['f:soirees'],fx:'hype',d:'Hype au début du combat.'},
 {id:'couronne',name:'La Couronne du Bouftou',slot:'chapeau',st:{hp:6,atk:2},own:['bouftou','f:krosmoz'],d:'Arrachée de haute lutte.'},
 {id:'solaires',name:'Les Lunettes de soleil',slot:'chapeau',st:{spd:3,atk:2},own:['f:potes'],d:'Souvenir de la Dune du Pilat.'},
 {id:'capuche',name:'La Capuche',slot:'chapeau',st:{hp:3},own:['f:dbd','f:destiny'],fx:'esquive',d:'+5 % d\'esquive.'},
 {id:'bague',name:'La Bague de fiançailles',slot:'acc',st:{hp:6},own:['yoann','lea'],fx:'calin',d:'Câlin au début du combat.'},
 {id:'montre',name:'La Montre',slot:'acc',st:{spd:4},own:['jenlain','lila'],fx:'montre',d:'Un retardataire qui la porte arrive dès la première action alliée.'},
 {id:'portefeuille',name:'Le Portefeuille',slot:'acc',st:{hp:4,atk:2},own:['kylian','f:argent'],d:'Bien rempli, rarement ouvert.'},
 {id:'croquettes',name:'Les Croquettes',slot:'acc',st:{hp:6},own:['animaux'],d:'Bonus doublé pour les animaux.'},
 {id:'de20',name:'Le Dé à 20 faces',slot:'acc',st:{atk:4,spd:2},own:['f:soirees','f:lol'],d:'Toujours un 1 au mauvais moment.'}
];
const ITEM={};ITEMS.forEach(i=>ITEM[i.id]=i);
function itemOwns(it,cid){const c=CARD[cid];return it.own.some(o=>o===cid||(o==='animaux'&&ANIMALS.has(cid))||(o.startsWith('f:')&&c.fam.includes(o.slice(2))));}
function itemStats(id,r,cid){const it=ITEM[id],m=IRAR[r]*(cid&&itemOwns(it,cid)?2:1),o={};for(const k in it.st)o[k]=Math.round(it.st[k]*m*10)/10;return o;}
/* ===== Lieux ===== */
const PLACES=[
 {id:'appart',name:"L'appart de Yoann et Léa",who:['f:foyer'],st:{atk:10,hp:10},d:'Foyer : +10 % ATK et PV.'},
 {id:'chezkylian',name:'Chez Kylian',who:['f:chezk'],st:{hp:15,atk:5},d:'Chez Kylian : +15 % PV et +5 % ATK.'},
 {id:'chezjl',name:'Chez Jenlain et Lila',who:['f:jl','f:bruyants'],st:{atk:15},d:'Jenlain & Lila et Bruyants : +15 % ATK.'},
 {id:'soiree',name:'La Soirée jeux',who:['f:soirees'],st:{atk:8,spd:8},d:'Soirées jeu : +8 % ATK et VIT.'},
 {id:'bureau',name:'Le Bureau',who:['f:boulot','f:paperasse'],st:{hp:15,atk:8},d:'Boulot et Paperasse : +15 % PV et +8 % ATK.'},
 {id:'canape',name:'Le Canapé',who:['animaux'],st:{hp:15},start:'calin',d:'Animaux : +15 % PV et Câlin au début.'},
 {id:'dune',name:'La Dune du Pilat',who:['tous'],st:{spd:6},d:'Toute l\'équipe : +6 % VIT.'},
 {id:'concert',name:'Le Concert de rap',who:['tous'],st:{atk:4},start:'hype',d:'Toute l\'équipe : +4 % ATK et Hype au début.'}
];
const PLACE={};PLACES.forEach(p=>PLACE[p.id]=p);
const placeMult=stars=>1+0.2*(stars||0);
function placeFor(pl,cid){const c=CARD[cid];return pl.who.some(o=>o==='tous'||(o==='animaux'&&ANIMALS.has(cid))||(o.startsWith('f:')&&c.fam.includes(o.slice(2))));}
/* ===== Donjons ===== */
const DUNGEONS={gold:{n:"Donjon de l'or",seed:7151},equip:{n:"Donjon de l'équipement",seed:9343}};
function genDungeon(kind,f){
 const r=mulberry(f*104729+DUNGEONS[kind].seed),lvl=10*f,stars=Math.min(5,Math.floor((f-1)/2));
 const w={C:Math.max(10,50-8*f),R:30+2*f,E:Math.min(35,8+5*f),L:Math.min(20,2+3*f)};
 const ids=[];let g=0;while(ids.length<5&&g++<300){const rr=rollW(w,r);const list=BYR[rr].filter(c=>!ids.includes(c.id));if(!list.length)continue;ids.push(list[Math.floor(r()*list.length)].id);}
 return ids.map(id=>({id,lvl,stars}));
}
const equipRates=f=>({C:Math.max(10,60-10*f),R:30+2*f,E:Math.min(35,6+5*f),L:Math.min(20,Math.max(0,3*(f-1)))});
const farmGoldPerHour=(kind,f)=>kind==='gold'?Math.round(3600*(1+6*f)):Math.round(3600*(1+6*f)*0.25);
// Farm continu : un tirage toutes les 10 min, jusqu'à 24 h sans récolter
const FARM_TICK_S=600,FARM_CAP_S=24*3600,FARM_P={ticket:1/3,item:1/3,jackpot:0.03};

const B1=m=>(b,u)=>{const t=b.pick(u);if(t)b.hit(u,t,m);return t;};
const KIT={
 jenlain:{atk:B1(1),skill(b,u){u.uses++;b.say(`${b.nm(u)} lance un Freestyle.`);b.foes(u).forEach(t=>b.hit(u,t,0.5+0.1*u.uses));},ult(b,u){b.say(`${b.nm(u)} donne un Concert !`,'ult');b.foes(u).forEach(t=>b.hit(u,t,1));b.allies(u).forEach(a=>b.apply(u,a,'hype',50));}},
 yoann:{atk:B1(1),skill(b,u){b.say(`${b.nm(u)} fixe le vide. Tout le monde le regarde.`);b.apply(u,u,'provoc',40);B1(0.8)(b,u);}},
 lea:{atk:B1(1),skill(b,u){let t=b.sides[u.side].lastAttacker;if(!t||!t.alive||!t.present||t.side===u.side)t=b.pick(u);if(!t)return;b.say(`${b.nm(u)} : « Tu lui as fait quoi ?! »`);b.hit(u,t,1+0.2*u.colere);},ult(b,u){b.say(`${b.nm(u)} explose (${u.colere} Colère).`,'ult');const m=0.6+0.25*u.colere;u.colere=0;b.foes(u).forEach(t=>b.hit(u,t,m));}},
 kylian:{atk:B1(1),skill(b,u){const fs=b.foes(u).filter(t=>t.st.hype||t.st.zen||t.st.calin||t.colere>0||t.shield>0);if(!fs.length){B1(1)(b,u);return;}const t=fs[b.rnd(fs.length)];let w;if(t.st.zen){u.st.zen=t.st.zen;delete t.st.zen;w='Zen';}else if(t.st.hype){u.st.hype=t.st.hype;delete t.st.hype;w='Hype';}else if(t.st.calin){u.st.calin=t.st.calin;delete t.st.calin;w='Câlin';}else if(t.colere>0){u.colere=Math.min(10,u.colere+t.colere);t.colere=0;w='sa Colère';}else{u.shield+=t.shield;t.shield=0;w='son Bouclier';}b.say(`${b.nm(u)} : « C'est à moi. » Il prend ${w} à ${b.nm(t)}.`);},ult(b,u){const v=Math.max(20,Math.round(u.cagnotte*0.4));b.say(`${b.nm(u)} rentabilise : Bouclier de ${v} pour l'équipe.`,'ult');b.allies(u).forEach(a=>{a.shield+=v;b.ev(a,'+'+v+' bouclier','pos');});u.cagnotte=0;}},
 geoffrey:{atk:B1(1),skill(b,u){b.say(`${b.nm(u)} éclate de rire. Malaise général.`);b.foes(u).forEach(t=>b.apply(u,t,'malaise',12));b.allies(u).forEach(a=>{if(a!==u&&b.rand()<1/3)b.apply(u,a,'malaise',12);});},ult(b,u){b.say(`${b.nm(u)} sort LA blague de trop.`,'ult');b.units.filter(x=>x.alive&&x.present&&x!==u).forEach(x=>b.apply(u,x,'malaise',22));b.apply(u,u,'double',22);}},
 lila:{atk:B1(1),skill(b,u){u.colere=Math.min(10,u.colere+2);b.say(`${b.nm(u)} : « Faut pas pousser. »`);B1(1.4)(b,u);}},
 ryuk:{atk:B1(1),skill(b,u){const r=b.rand();if(r<0.4){const t=b.pick(u);if(!t)return;b.say(`${b.nm(u)} renverse un verre sur ${b.nm(t)}.`);b.apply(u,t,'malaise',25);}else if(r<0.8){b.say(`${b.nm(u)} fait tomber un truc de l'étagère.`);b.foes(u).forEach(t=>b.hit(u,t,0.7));}else{b.say(`${b.nm(u)} s'est coincé derrière le meuble.`);u.st.malaise={t:20};}}},
 yuumi:{atk:B1(0.6),skill(b,u){const a=b.mostHurt(u);b.say(`${b.nm(u)} réclame des papouilles à ${b.nm(a)}.`);b.apply(u,a,'calin',50);}},
 traffy:{atk:B1(1),skill(b,u){b.say(`${b.nm(u)} fait la sieste.`);b.apply(u,u,'zen',50);u.shield+=Math.round(u.maxhp*0.2);}},
 echo:{atk:B1(1),skill(b,u){const a=b.mostHurt(u);b.say(`${b.nm(u)} fait un câlin à ${b.nm(a)}.`);b.apply(u,a,'calin',50);}},
 zoya:{atk(b,u){const t=b.pick(u);if(t)b.hit(u,t,t.d.fam.includes('nuisibles')?3:1);},skill(b,u){const fs=b.visible(u);if(!fs.length)return;const t=fs.reduce((a,c)=>a.hp<c.hp?a:c);b.say(`${b.nm(u)} croque ${b.nm(t)}.`);b.hit(u,t,t.d.fam.includes('nuisibles')?6:2);if(!t.alive)b.heal(u,u.maxhp*0.25);}},
 assurance:{atk(b,u){const t=b.pick(u);if(!t)return;b.hit(u,t,1);if(t.alive)b.apply(u,t,'piece',9999);}},
 caf:{atk(b,u){const t=b.pick(u);if(t)b.hit(u,t,0.3+b.rand()*1.9);}},
 recommande:{atk(b,u){const t=b.pick(u,{pierce:true});if(t)b.hit(u,t,1,{pierce:true});}},
 service:{atk(b,u){const t=b.pick(u);if(!t)return;b.hit(u,t,1);if(b.rand()<0.35)b.apply(u,t,'attente',20);}},
 collegue:{atk(b,u){const t=b.pick(u);if(!t)return;b.hit(u,t,1);b.apply(u,t,'stress',40);if(u.colle&&u.colle!==t&&u.colle.st.flemme&&u.colle.st.flemme.src===u)delete u.colle.st.flemme;if(t.alive&&b.apply(u,t,'flemme',9999))u.colle=t;}},
 souris:{atk:B1(0.6)},
 moustique:{atk(b,u){const t=b.pick(u);if(!t)return;b.hit(u,t,0.5);b.apply(u,t,'stress',40);}},
 linge:{atk(b,u){B1(0.8)(b,u);const g=Math.round(u.maxhp*0.05);u.maxhp+=g;u.hp+=g;}},
 vaisselle:{atk(b,u){u.uses++;B1(0.6+0.15*u.uses)(b,u);}},
 aspirateur:{atk(b,u){const t=b.pick(u);if(!t)return;b.hit(u,t,1);if(ANIMALS.has(t.id))b.apply(u,t,'angoisse',40);}},
 chaussette:{atk(b,u){B1(u.alone?2:1)(b,u);}},
 veto:{atk(b,u){B1(0.8)(b,u);const a=b.mostHurt(u);if(a)b.heal(a,a.maxhp*0.08);}},
 reveil:{atk(b,u){const t=b.pick(u);if(t)b.hit(u,t,RETARD.has(t.id)?2:1);}},
 embouteillages:{atk(b,u){const t=b.pick(u);if(!t)return;b.hit(u,t,0.8);b.apply(u,t,'flemme',40);}},
 wifi:{atk(b,u){const t=b.pick(u);if(!t)return;b.hit(u,t,0.8);b.apply(u,t,'attente',20);}},
 messagevu:{atk(b,u){const t=b.pick(u);if(!t)return;b.hit(u,t,0.8);b.apply(u,t,'angoisse',40);}},
 facture:{atk(b,u){const t=b.pick(u);if(!t)return;b.hit(u,t,0.9);b.apply(u,t,'deprime',50);}},
 colis:{atk:B1(1.6)},
 udyr:{atk:B1(1),skill(b,u){const t=b.pick(u);if(!t)return;b.say(`${b.nm(u)} charge comme un ours.`);b.hit(u,t,1.4);b.apply(u,t,'malaise',20);}},
 ekko:{atk(b,u){const t=b.pick(u);if(!t)return;u.uses++;b.hit(u,t,1);if(u.uses%3===0&&t.alive){b.hit(u,t,0.6);b.apply(u,u,'hype',30);}},skill(b,u){const back=(u.hist&&u.hist.length)?u.hist[0]:u.hp;b.say(`${b.nm(u)} remonte le temps.`);if(back>u.hp){const g=Math.round(back-u.hp);u.hp=Math.min(u.maxhp,back);b.ev(u,'+'+g,'heal');}b.foes(u).forEach(t=>b.hit(u,t,0.5));}},
 thresh:{atk:B1(1),skill(b,u){const a=b.mostHurt(u),v=Math.round(u.maxhp*0.2);a.shield+=v;b.ev(a,'+'+v+' bouclier','pos');const t=b.pick(u);b.say(`${b.nm(u)} tend sa lanterne.`);if(t)b.apply(u,t,'malaise',15);}},
 chasseuse:{atk(b,u){const t=b.pick(u,{pierce:true});if(t)b.hit(u,t,1);},skill(b,u){b.say(`${b.nm(u)} lance une salve de hachettes.`);for(let i=0;i<3;i++){const f=b.foes(u);if(!f.length)break;b.hit(u,f[b.rnd(f.length)],0.7);}}},
 harpie:{atk:B1(1),skill(b,u){u.st.cachee={t:25};b.ev(u,'Cachée','pos');const f=b.visible(u);if(!f.length)return;const t=f.reduce((a,c)=>a.hp<c.hp?a:c);b.say(`${b.nm(u)} traverse les phases et surgit sur ${b.nm(t)}.`);b.hit(u,t,1.5);b.apply(u,t,'angoisse',40);}},
 legion:{atk(b,u){let f=b.visible(u);const prov=b.foes(u).filter(x=>x.st.provoc);if(prov.length)f=prov;else if(f.length>1&&u.colle)f=f.filter(x=>x!==u.colle);if(u.confused){B1(1)(b,u);return;}if(!f.length)return;const t=f[b.rnd(f.length)];u.colle=t;b.hit(u,t,0.9);b.apply(u,t,'stress',60);},skill(b,u){b.say(`${b.nm(u)} entre en Frénésie.`);b.foes(u).forEach(t=>{b.hit(u,t,0.6);b.apply(u,t,'stress',60);});u.st.flemme={t:25};b.ev(u,'Essoufflé','neg');}},
 lost:{atk:B1(1),skill(b,u){b.say(`${b.nm(u)} tire des larmes spectrales.`);const f=b.foes(u);for(let i=0;i<2&&f.length;i++){const t=f.splice(b.rnd(f.length),1)[0];b.hit(u,t,1,{pierce:true});}if(!u.mantle){u.mantle=true;b.ev(u,'Manteau sacré','pos');}}},
 azazel:{atk(b,u){const t=b.pick(u);if(!t)return;b.hit(u,t,1);const o=b.foes(u).filter(x=>x!==t);if(o.length)b.hit(u,o[b.rnd(o.length)],0.5);},skill(b,u){b.say(`${b.nm(u)} crache un Brimstone.`);b.foes(u).forEach(t=>b.hit(u,t,0.9));}},
 magdalene:{atk:B1(1),skill(b,u){const a=b.mostHurt(u);b.say(`${b.nm(u)} partage un Yum Heart avec ${b.nm(a)}.`);b.heal(a,a.maxhp*0.25);if(a!==u)b.heal(u,u.maxhp*0.1);}},
 chasseur:{atk:B1(1),skill(b,u){b.say(`${b.nm(u)} dégaine le Pistolet d'or.`);for(let i=0;i<3;i++){const f=b.visible(u);if(!f.length)break;const t=f.reduce((a,c)=>a.hp<c.hp?a:c);b.hit(u,t,0.8);}}},
 arcaniste:{atk:B1(1),skill(b,u){b.say(`${b.nm(u)} ouvre une Faille de soin.`);b.allies(u).forEach(a=>{b.heal(a,a.maxhp*0.08);b.apply(u,a,'calin',40);});}},
 steamer:{atk:B1(1),skill(b,u){b.say(`${b.nm(u)} déploie la Gardienne.`);b.allies(u).forEach(a=>{const v=Math.round(a.maxhp*0.12);a.shield+=v;b.ev(a,'+'+v+' bouclier','pos');});}},
 yugo:{atk(b,u){if(u.confused){B1(1)(b,u);return;}const f=b.foes(u);if(f.length)b.hit(u,f[b.rnd(f.length)],1);},skill(b,u){b.say(`${b.nm(u)} lance un Wakmeha.`);b.foes(u).forEach(t=>b.hit(u,t,0.7));b.apply(u,u,'hype',30);}},
 bouftou:{atk:B1(1),skill(b,u){const t=b.pick(u);if(!t)return;b.say(`${b.nm(u)} charge, couronne en avant.`);b.hit(u,t,1.2);b.apply(u,t,'malaise',20);const v=Math.round(u.maxhp*0.12);u.shield+=v;b.ev(u,'+'+v+' bouclier','pos');}}
};
const AFTER={
 traffy(b,u){u.stacks=Math.min(15,u.stacks+1);},
 zoya(b,u){if(u.acts%2===0){u.shield+=Math.round(u.maxhp*0.15);b.ev(u,'Bronzette','pos');}},
 proprio(b,u){if(u.acts%3===0){b.say(`${b.nm(u)} réclame le loyer.`);b.foes(u).filter(t=>t.id!=='kylian').forEach(t=>b.hit(u,t,0.5));}},
 caf(b,u){const as=b.allies(u);if(!as.length)return;if(b.rand()<0.2){const w=as.filter(a=>a.st.hype||a.st.zen||a.st.calin||a.colere>0||a.shield>0);if(!w.length)return;const a=w[b.rnd(w.length)];if(a.st.hype)delete a.st.hype;else if(a.st.zen)delete a.st.zen;else if(a.st.calin)delete a.st.calin;else if(a.colere>0)a.colere--;else a.shield=0;b.say(`${b.nm(u)} réclame un trop-perçu à ${b.nm(a)}.`);b.ev(a,'Trop-perçu','neg');return;}const a=as[b.rnd(as.length)];const r=b.rnd(5);if(r===0)b.apply(u,a,'hype',40);else if(r===1)b.apply(u,a,'zen',30);else if(r===2)b.apply(u,a,'calin',40);else if(r===3){a.colere=Math.min(10,a.colere+1);b.ev(a,'Colère','pos');}else{const v=Math.round(a.maxhp*0.1);a.shield+=v;b.ev(a,'+'+v+' bouclier','pos');}},
 chef(b,u){if(u.acts%3===0){const as=b.allies(u).filter(x=>x!==u);if(!as.length)return;const a=as[b.rnd(as.length)];a.gauge=1000;a.confused=true;b.say(`${b.nm(u)} donne un ordre absurde à ${b.nm(a)}.`);}},
 udyr(b,u){if(u.acts%2){u.colere=Math.min(10,u.colere+1);b.ev(u,'Posture offensive','pos');}else{const v=Math.round(u.maxhp*0.08);u.shield+=v;b.ev(u,'Posture défensive','pos');}},
 ekko(b,u){u.hist=(u.hist||[]).concat([u.hp]).slice(-3);},
 magdalene(b,u){b.heal(u,u.maxhp*0.03,{silent:true});},
 steamer(b,u){const f=b.foes(u);if(f.length){const t=f[b.rnd(f.length)];b.fx.push({k:'act',uid:u.uid,name:'Harponneuse'});b.hit(u,t,0.4);}},
 bug(b,u){const r=b.rand();if(r<0.25){const t=b.pick(u);if(t){b.say(`${b.nm(u)} fait planter ${b.nm(t)}.`);b.apply(u,t,'malaise',15);}}else if(r<0.5){b.apply(u,u,'hype',30);}else if(r<0.65){const as=b.allies(u).filter(x=>x!==u);if(as.length){const a=as[b.rnd(as.length)];b.say(`${b.nm(u)} touche sa propre équipe.`);b.hit(u,a,0.5);}}}
};

class Battle{
 constructor(teamA,teamB,seed,opt){
  opt=opt||{};
  this.seed=(seed==null?Math.floor(Math.random()*2147483647):seed)>>>0;this.rand=mulberry(this.seed);this.rnd=n=>Math.floor(this.rand()*n);
  this.t=0;this.log=[];this.events=[];this.fx=[];this.queue=[];this.over=false;this.winner=null;this.units=[];
  this.sides=[{actions:0,syn:{},lastAttacker:null},{actions:0,syn:{},lastAttacker:null}];
  teamA.forEach(c=>this.add(c,0));teamB.forEach(c=>this.add(c,1));
  [0,1].forEach(s=>{
   const side=this.sides[s],us=this.units.filter(u=>u.side===s);side.syn=famCounts(us.map(u=>u.id));const y=side.syn;
   let atk=1,hp=1,spd=1,dodge=0;
   if((y.potes||0)>=5)atk*=1.25;else if((y.potes||0)>=3)atk*=1.10;
   if((y.quotidien||0)>=5)atk*=1.20;else if((y.quotidien||0)>=3)atk*=1.10;
   if((y.lents||0)>=3)hp*=1.4;else if((y.lents||0)>=2)hp*=1.2;
   if((y.corvee||0)>=4)hp*=1.3;else if((y.corvee||0)>=2)hp*=1.15;
   if((y.poste||0)>=2)spd*=1.2;
   if((y.nuisibles||0)>=2)dodge+=0.1;
   if((y.soirees||0)>=3)spd*=1.15;
   if((y.lol||0)>=2)atk*=1.10;
   if((y.isaac||0)>=3){atk*=1.15;hp*=1.15;}else if((y.isaac||0)>=2)atk*=1.10;
   if((y.krosmoz||0)>=2)spd*=1.15;
   if((y.krosmoz||0)>=3)hp*=1.15;
   const pl=s===0?opt.placeA:opt.placeB,P=pl&&PLACE[pl.id];
   us.forEach(u=>{
    let a=atk,h=hp,v=spd;
    (u.gear||[]).forEach(g=>{const it=ITEM[g.id];if(!it)return;const o=itemStats(g.id,g.r,u.id);a*=1+(o.atk||0)/100;h*=1+(o.hp||0)/100;v*=1+(o.spd||0)/100;if(it.fx==='esquive')u.dodge+=0.05;if(it.fx==='montre')u.arriveAt=1;});
    if(P&&placeFor(P,u.id)){const m=placeMult(pl.stars);a*=1+(P.st.atk||0)*m/100;h*=1+(P.st.hp||0)*m/100;v*=1+(P.st.spd||0)*m/100;}
    u.atkMul*=a;u.maxhp=Math.round(u.maxhp*h);u.hp=u.maxhp;u.spdMul*=v;u.dodge+=dodge;u.alone=u.id==='chaussette'&&us.filter(x=>x.d.fam.includes('quotidien')).length===1;
   });
  });
  [0,1].forEach(s=>{
   const y=this.sides[s].syn,us=this.units.filter(u=>u.side===s),foes=this.units.filter(u=>u.side!==s&&u.present);
   us.forEach(u=>{
    if(u.id==='lundi'){this.say(`${this.nm(u)} : Flemme générale en face.`);foes.forEach(t=>this.apply(u,t,'flemme',50));}
    if(u.id==='file'&&foes.length){const t=foes.reduce((a,c)=>this.spd(a)>this.spd(c)?a:c);this.say(`${this.nm(u)} : « Veuillez patienter. »`);this.apply(u,t,'attente',40);}
   });
   const src=us[0];if(!src)return;
   if((y.matin||0)>=2)foes.forEach(t=>this.apply(src,t,'flemme',40));
   if((y.relous||0)>=2&&foes.length)this.apply(src,foes[this.rnd(foes.length)],'stress',50);
   if((y.lignee||0)>=2)us.filter(u=>u.present).forEach(a=>this.apply(src,a,'calin',50));
   if((y.lol||0)>=3)us.forEach(a=>{a.shield+=Math.round(a.maxhp*0.1);});
   if((y.destiny||0)>=2)us.forEach(a=>{a.shield+=Math.round(a.maxhp*0.15);});
   if((y.dbd||0)>=3)foes.forEach(t=>this.apply(src,t,'angoisse',50));else if((y.dbd||0)>=2&&foes.length)this.apply(src,foes[this.rnd(foes.length)],'angoisse',50);
   const pl=s===0?opt.placeA:opt.placeB,P=pl&&PLACE[pl.id];
   us.forEach(u=>{
    (u.gear||[]).forEach(g=>{const it=ITEM[g.id];if(it&&(it.fx==='calin'||it.fx==='hype'))this.apply(u,u,it.fx,it.fx==='calin'?50:30);});
    if(P&&P.start&&placeFor(P,u.id))this.apply(u,u,P.start,P.start==='calin'?50:30);
    if(u.id==='chasseuse'&&foes.length){const t=foes[this.rnd(foes.length)];this.say(`${this.nm(u)} fredonne sa berceuse.`);this.apply(u,t,'angoisse',50);}
    if(u.id==='bouftou'&&u.present)this.apply(u,u,'provoc',60);
    if(u.id==='harpie'){u.st.cachee={t:40};this.ev(u,'Cachée','pos');}
    if(u.id==='arcaniste'&&u.present)us.filter(a=>a.present).forEach(a=>this.apply(u,a,'hype',30));
   });
  });
 }
 add(c,side){
  const d=CARD[c.id],m=statMult(c.lvl||1,c.stars||0);
  const u={uid:this.units.length,id:c.id,d,side,lvl:c.lvl||1,stars:c.stars||0,maxhp:Math.round(d.hp*8*m),atk0:d.atk*m,spd0:d.spd,hp:0,gauge:RETARD.has(c.id)?0:100+this.rand()*450,alive:true,present:!RETARD.has(c.id),st:{},colere:0,shield:0,cd:2,charge:0,uses:0,acts:0,atkMul:1,spdMul:1,dodge:c.id==='souris'?0.25:c.id==='lost'?0.2:(c.id==='azazel'||c.id==='chasseur')?0.15:0,mantle:c.id==='lost',gear:(c.gear||[]).filter(g=>ITEM[g.id]&&IRAR[g.r]).slice(0,4),arriveAt:3,immune:new Set(c.id==='yoann'?['angoisse','malaise','stress']:c.id==='geoffrey'?['malaise','angoisse']:[]),once:false,discreet:c.id==='lila',cagnotte:0,stacks:0,confused:false,colle:null,alone:false};
  u.hp=u.maxhp;this.units.push(u);
 }
 nm(u){return u?`<b class="s${u.side}">${u.d.name}</b>`:'?';}
 say(html,cls){this.log.push({html,cls:cls||''});if(this.log.length>80)this.log.shift();}
 ev(u,text,kind){this.events.push({uid:u.uid,text,kind});}
 atk(u){return u.atk0*u.atkMul*(1+0.1*u.colere)*(u.st.double?2:1)*(1+0.1*u.stacks);}
 spd(u){return u.spd0*u.spdMul*(u.st.hype?1.3:1)*(u.st.flemme?0.7:1)*(1+0.1*u.stacks);}
 foes(u){return this.units.filter(x=>x.side!==u.side&&x.alive&&x.present);}
 allies(u){return this.units.filter(x=>x.side===u.side&&x.alive&&x.present);}
 hidden(x){if(x.st.cachee)return true;if(x.discreet)return this.units.some(y=>y.side===x.side&&y!==x&&y.alive&&y.present&&!y.discreet);return false;}
 visible(u){const f=this.foes(u),v=f.filter(x=>!this.hidden(x));return v.length?v:f;}
 mostHurt(u){const a=this.allies(u);if(!a.length)return u;return a.reduce((p,c)=>c.hp/c.maxhp<p.hp/p.maxhp?c:p);}
 pick(u,o={}){
  if(u.confused){u.confused=false;const p=this.units.filter(x=>x.alive&&x.present&&x!==u);return p.length?p[this.rnd(p.length)]:null;}
  const f=this.foes(u);if(!f.length)return null;
  const prov=f.filter(x=>x.st.provoc);if(prov.length)return prov[this.rnd(prov.length)];
  const v=o.pierce?f:this.visible(u);return v[this.rnd(v.length)];
 }
 hit(s,t,mult,o={}){
  if(!t||!t.alive)return 0;
  this.fx.push({k:'hit',from:s.uid,to:t.uid});
  if(s.id==='bug'&&this.units.some(x=>x.id==='kylian'&&x.side!==s.side&&x.alive&&x.present)&&this.rand()<0.4){this.ev(t,'Raté','miss');return 0;}
  if(!o.pierce&&t.dodge>0&&this.rand()<t.dodge){this.ev(t,'Esquive','miss');return 0;}
  if(t.mantle){t.mantle=false;this.ev(t,'Manteau sacré','info');if(s.side!==t.side)this.sides[t.side].lastAttacker=s;return 0;}
  let dmg=this.atk(s)*mult*elemMult(s.d.el,t.d.el);
  if(t.st.angoisse)dmg*=1.25;
  if(s.id==='impots'&&t.id==='kylian')dmg*=1.5;
  dmg=Math.max(1,Math.round(dmg*(0.9+this.rand()*0.2)));
  if(t.shield>0&&!o.pierce){const a=Math.min(t.shield,dmg);t.shield-=a;dmg-=a;if(a>0&&dmg===0){this.ev(t,'Bloqué','info');}}
  if(dmg>0)this.damage(t,dmg,s);
  if(t.alive){if(CHARGE.has(t.id))t.charge=Math.min(100,t.charge+10);if(t.id==='lea')t.colere=Math.min(10,t.colere+1);if(t.id==='yuumi')t.st.cachee={t:20};}
  if(s.side!==t.side)this.sides[t.side].lastAttacker=s;
  if(s.id==='impots'&&dmg>0){const a=this.mostHurt(s);if(a)this.heal(a,dmg*0.3,{silent:true});}
  if(s.id==='kylian')s.cagnotte+=dmg*0.3;
  return dmg;
 }
 damage(t,dmg,src){
  t.hp-=dmg;this.ev(t,'-'+dmg,'dmg');
  if(t.id==='yugo'&&!t.once&&t.hp>0&&t.hp<t.maxhp*0.3){t.once=true;t.st.cachee={t:40};this.say(`${this.nm(t)} disparaît dans un portail.`);}
  if(t.hp<=0){if(t.id==='yoann'&&!t.once){t.once=true;t.hp=1;t.shield+=Math.round(t.maxhp*0.3);this.say(`${this.nm(t)} est Inébranlable. Il tient à 1 PV.`,'ult');}else this.kill(t);}
 }
 kill(t){
  t.alive=false;t.hp=0;this.say(`${this.nm(t)} est K.O.`);
  this.units.filter(x=>x.id==='thresh'&&x.alive&&x.side!==t.side).forEach(th=>{th.atkMul*=1.06;const g=Math.round(th.maxhp*0.05);th.maxhp+=g;th.hp+=g;this.ev(th,'Âme','pos');});
  if(t.id==='collegue'&&t.colle&&t.colle.st.flemme&&t.colle.st.flemme.src===t)delete t.colle.st.flemme;
  this.units.filter(x=>x.side===t.side&&x.alive).forEach(x=>{
   if(x.id==='lila'&&!x.once){x.once=true;x.discreet=false;x.atkMul*=1.6;this.say(`${this.nm(x)} n'est plus du tout timide.`,'ult');}
  });
  if(t.d.fam.includes('foyer')&&(this.sides[t.side].syn.foyer||0)>=2)this.units.filter(x=>x.side===t.side&&x.alive&&x.d.fam.includes('foyer')).forEach(x=>{x.colere=Math.min(10,x.colere+2);this.ev(x,'+2 Colère','pos');});
 }
 heal(t,amt,o={}){
  if(!t||!t.alive)return;
  if(t.st.piece){delete t.st.piece;this.ev(t,'Soin annulé','neg');return;}
  if(!o.queued&&this.units.some(x=>x.id==='assurance'&&x.side===t.side&&x.alive)){this.queue.push({at:this.t+20,u:t,amt:amt*2});if(!o.silent)this.ev(t,'Dossier en cours','info');return;}
  if(t.st.deprime)amt*=0.5;
  if((this.sides[t.side].syn.sante||0)>=2)amt*=1.3;
  amt=Math.round(amt);if(amt<=0)return;t.hp=Math.min(t.maxhp,t.hp+amt);this.ev(t,'+'+amt,'heal');
 }
 apply(s,t,name,dur,noRenvoi){
  if(!t||!t.alive)return false;
  if(NEG.has(name)){
   if(t.immune.has(name)){this.ev(t,'Immunisé','info');return false;}
   if(t.st.zen){this.ev(t,'Zen','info');return false;}
   if(t.id==='echo'&&s&&s.side!==t.side&&s.alive&&!noRenvoi){this.say(`${this.nm(t)} miaule et renvoie ${ST_LABEL[name]} à ${this.nm(s)}.`);return this.apply(t,s,name,dur,true);}
   const y=s?this.sides[s.side].syn:{};
   if((y.paperasse||0)>=2)dur*=1.3;
   if(name==='malaise'&&(y.bruyants||0)>=2)dur*=1.4;
   if(name==='attente'&&(y.numerique||0)>=2)dur*=1.5;
   if(name==='malaise')this.units.filter(x=>x.id==='geoffrey'&&x.side!==t.side&&x.alive&&!x.st.hype).forEach(g=>{g.st.hype={t:20};});
  }
  const cur=t.st[name];
  if(name==='stress'&&s&&s.id==='legion')dur*=1.5;
  t.st[name]={t:Math.max(cur?cur.t:0,Math.round(dur)),src:s,mul:(name==='stress'&&s&&(this.sides[s.side].syn.boulot||0)>=2)?1.5:1};
  this.ev(t,ST_LABEL[name],NEG.has(name)?'neg':'pos');return true;
 }
 arrivals(){
  [0,1].forEach(s=>{
   const side=this.sides[s],abs=this.units.filter(u=>u.side===s&&u.alive&&!u.present);if(!abs.length)return;
   const none=!this.units.some(u=>u.side===s&&u.alive&&u.present);
   const ready=abs.filter(u=>none||side.actions>=u.arriveAt);
   if(ready.length){
    const jl=(side.syn.jl||0)>=2;
    ready.forEach(u=>{u.present=true;u.gauge=0;this.say(`${this.nm(u)} arrive enfin${jl?' avec sa moitié':''}.`);const t=this.pick(u);if(t)this.hit(u,t,1.2*(jl?1.5:1));});
   }
  });
 }
 act(u,depth=0){
  if(!u.alive||!u.present||this.over)return;
  this.sides[u.side].actions++;
  const k=KIT[u.id]||{atk:B1(1)};let kind='atk';
  if(CHARGE.has(u.id)&&u.charge>=100){kind='ult';u.charge=0;}
  else if(SKILL_CD[u.id]&&u.cd<=0){kind='skill';u.cd=SKILL_CD[u.id];}
  if(kind!=='atk'){const kk=u.d.kit.find(x=>x[0]===(kind==='ult'?'Ulti':'Compétence'));this.fx.push({k:'act',uid:u.uid,name:kk?kk[1]:'',kind});}
  (k[kind]||k.atk)(this,u);
  u.cd--;u.acts++;this.lastActor=u.uid;
  if(CHARGE.has(u.id)&&kind!=='ult'&&!(u.id==='geoffrey'&&u.st.double))u.charge=Math.min(100,u.charge+20);
  if(u.alive&&u.st.stress){const d=Math.max(1,Math.round(u.maxhp*0.04*(u.st.stress.mul||1)));this.ev(u,'-'+d+' stress','neg');this.damage(u,d,null);}
  if(u.alive&&AFTER[u.id])AFTER[u.id](this,u);
  this.arrivals();this.checkEnd();
  if(u.id==='ryuk'&&u.alive&&depth<2&&!this.over&&this.rand()<0.35){this.ev(u,'Zoomies','pos');this.act(u,depth+1);}
 }
 checkEnd(){
  if(this.over)return;
  const a=this.units.some(u=>u.side===0&&u.alive),b=this.units.some(u=>u.side===1&&u.alive);
  if(!b)this.end(0);else if(!a)this.end(1);
 }
 end(w,reason){this.over=true;this.winner=w;this.reason=reason||'';}
 step(){
  if(this.over)return;
  this.t++;
  this.queue=this.queue.filter(q=>{if(q.at<=this.t){this.heal(q.u,q.amt,{queued:true});return false;}return true;});
  for(const u of this.units){
   if(!u.alive||!u.present)continue;
   for(const k in u.st){if(--u.st[k].t<=0)delete u.st[k];}
   if(u.st.calin&&this.t%10===0)this.heal(u,u.maxhp*0.02,{silent:true});
   if(u.st.malaise||u.st.attente)continue;
   u.gauge+=this.spd(u);
  }
  this.arrivals();
  let g=0;
  while(!this.over&&g++<30){
   const ready=this.units.filter(u=>u.alive&&u.present&&u.gauge>=1000&&!u.st.malaise&&!u.st.attente).sort((a,b)=>b.gauge-a.gauge);
   if(!ready.length)break;
   const u=ready[0];u.gauge-=1000;this.act(u);
  }
  this.checkEnd();
  if(this.t>=4000&&!this.over){this.say('Temps écoulé.');this.end(1,'Temps écoulé');}
 }
}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function rollW(w,r){const tot=Object.values(w).reduce((a,b)=>a+b,0);let x=r()*tot;for(const k in w){x-=w[k];if(x<0)return k;}return 'C';}
function genEnemies(n){
 const r=mulberry(n*7919+13),size=n<=2?3:n<=5?4:5,lvl=1+Math.floor((n-1)*0.8),stars=Math.min(5,Math.floor(n/15)),boss=n%10===0;
 const w={C:Math.max(15,70-3*n),R:25+n,E:Math.min(25,n),L:n>=8?Math.min(15,n-7):0};
 const ids=[];if(boss)ids.push(BYR.L[Math.floor(r()*BYR.L.length)].id);
 let g=0;while(ids.length<size&&g++<300){const rr=rollW(w,r);const list=BYR[rr].filter(c=>!ids.includes(c.id));if(!list.length)continue;ids.push(list[Math.floor(r()*list.length)].id);}
 return ids.map(id=>({id,lvl:lvl+(boss?2:0),stars}));
}


/* ===== Règles du jeu côté serveur (seule source de vérité) ===== */
const START_GOLD=500,START_TICKETS=10,PITY=60,PVP_PER_DAY=5,PLACE_CHANCE=0.06,MAX_ITEMS=300,MAX_TEAMS=5;
const RATES={C:60,R:28,E:9,L:3};
const RWEIGHT={C:1,R:2,E:4,L:8};
const levelCost=l=>Math.round(40*Math.pow(l,1.6));
class GameError extends Error{constructor(code,msg,extra){super(msg);this.code=code;this.extra=extra;}}
const fail=(code,msg,extra)=>{throw new GameError(code,msg,extra);};

function collectionStats(cards){
 let score=0,count=0;
 for(const id in cards){const c=CARD[id];if(!c)continue;count++;score+=RWEIGHT[c.r]*(2+cards[id].stars);}
 return {score,count};
}
/* Farm continu : un tirage par tranche de 10 min (ticket, objet, or variable), 24 h max */
function farmBank(p,nowMs,rnd){
 const f=p.farm,dt=Math.max(0,(nowMs-Date.parse(p.last_collect))/1000),capped=dt>FARM_CAP_S;
 const units=Math.floor(Math.min(dt,FARM_CAP_S)/FARM_TICK_S);
 const out={units,seconds:units*FARM_TICK_S,gold:0,tickets:0,items:[],jackpots:0,farm:f||null};
 if(f&&f.kind&&f.floor>=1&&units>0&&rnd){
  const per=farmGoldPerHour(f.kind,f.floor)*FARM_TICK_S/3600*goldBonus(p.team||[]);
  for(let i=0;i<units;i++){
   let g=per*(0.5+rnd());if(f.kind==='gold'&&rnd()<FARM_P.jackpot){g*=5;out.jackpots++;}
   out.gold+=g;
   if(rnd()<FARM_P.ticket)out.tickets++;
   if(f.kind==='equip'&&rnd()<FARM_P.item)out.items.push(rollItem(f.floor,rnd));
  }
  out.gold=Math.floor(out.gold);
 }
 out.next=capped?new Date(nowMs).toISOString():new Date(Date.parse(p.last_collect)+units*FARM_TICK_S*1000).toISOString();
 if(!f||!f.kind)out.next=new Date(nowMs).toISOString();
 return out;
}
function rollItem(floor,rnd,minR){
 let r=rollW(equipRates(floor),rnd);if(minR&&RORDS[r]<RORDS[minR])r=minR;
 return {id:ITEMS[Math.floor(rnd()*ITEMS.length)].id,r};
}
const RORDS={C:0,R:1,E:2,L:3};
/* Ajoute des objets à l'inventaire ; au-delà de la limite, ils sont revendus */
function addItems(p,list){
 const items=[...(p.items||[])];let seq=p.item_seq||0,gold=0;
 for(const it of list){if(items.length>=MAX_ITEMS){gold+=SELL[it.r];continue;}items.push({u:++seq,id:it.id,r:it.r,on:null});}
 return {items,item_seq:seq,gold};
}
function teamsOf(p){
 const t=Array.isArray(p.teams)?p.teams.slice(0,MAX_TEAMS):[];
 while(t.length<MAX_TEAMS)t.push({n:'Équipe '+(t.length+1),ids:[],place:null});
 if(!t.some(x=>x.ids&&x.ids.length)&&(p.team||[]).length)t[0]={...t[0],ids:[...p.team]};
 return t.map((x,i)=>({n:String(x.n||('Équipe '+(i+1))).slice(0,20),ids:Array.isArray(x.ids)?x.ids:[],place:x.place||null}));
}
const placeOf=(p,id)=>id&&(p.places||{})[id]!=null?{id,stars:p.places[id]}:null;
function parisDay(ms){return new Intl.DateTimeFormat('fr-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ms));}
const unitsOf=(ids,cards,items)=>(ids||[]).filter(id=>cards[id]).map(id=>({id,lvl:cards[id].lvl,stars:cards[id].stars,gear:(items||[]).filter(i=>i.on===id).map(i=>({id:i.id,r:i.r}))}));

function makeGame(db,now=()=>Date.now()){
 async function getProfile(uid){const {data,error}=await db.from('profiles').select('*').eq('id',uid).maybeSingle();if(error)throw error;return data;}
 async function getCards(uid){const {data,error}=await db.from('cards').select('card_id,lvl,stars').eq('user_id',uid);if(error)throw error;const o={};(data||[]).forEach(c=>{o[c.card_id]={lvl:c.lvl,stars:c.stars};});return o;}
 async function commit(p,patch){
  const {data,error}=await db.from('profiles').update({...patch,version:p.version+1}).eq('id',p.id).eq('version',p.version).select('*').maybeSingle();
  if(error)throw error;if(!data)fail('conflict','Une autre action était en cours, réessaie.');return data;
 }
 async function withProfile(uid,f){
  for(let i=0;;i++){
   const [p,cards]=await Promise.all([getProfile(uid),getCards(uid)]);if(!p)fail('noprofile','Crée d\'abord ton profil.');
   try{return await f(p,cards);}catch(e){if(e.code==='conflict'&&i<3)continue;throw e;}
  }
 }
 async function upsertCards(uid,list){
  if(!list.length)return;
  const {error}=await db.from('cards').upsert(list.map(c=>({user_id:uid,card_id:c.id,lvl:c.lvl,stars:c.stars})),{onConflict:'user_id,card_id'});
  if(error)throw error;
 }
 async function full(uid,extra={},p0,c0){
  if(p0&&c0)return {...extra,profile:p0,cards:c0,now:now()};
  const [p,cards]=await Promise.all([getProfile(uid),getCards(uid)]);
  return {...extra,profile:p,cards,now:now()};
 }

 const A={};
 A.state=async uid=>full(uid);

 A.create=async(uid,{pseudo,legend})=>{
  pseudo=String(pseudo||'').trim();
  if(!/^[\p{L}\p{N} _.'-]{2,20}$/u.test(pseudo))fail('pseudo','Pseudo de 2 à 20 caractères (lettres, chiffres, espace, . _ -).');
  if(!CARD[legend]||CARD[legend].r!=='L')fail('legend','Choisis une des six légendaires.');
  if(await getProfile(uid))fail('exists','Ce compte a déjà un profil.');
  const cards={[legend]:{lvl:1,stars:0}},cs=collectionStats(cards);
  const {error}=await db.from('profiles').insert({id:uid,pseudo,legend,gold:START_GOLD,tickets:START_TICKETS,team:[legend],defense:[legend],teams:teamsOf({team:[legend]}),team_idx:0,items:[],item_seq:0,places:{},dungeons:{gold:0,equip:0},farm:null,collection_score:cs.score,collection_count:cs.count,last_collect:new Date(now()).toISOString(),next_fight_at:new Date(now()).toISOString()});
  if(error){if(String(error.code)==='23505')fail('pseudo','Ce pseudo est déjà pris.');throw error;}
  await upsertCards(uid,[{id:legend,lvl:1,stars:0}]);
  return full(uid);
 };

 A.pull=async(uid,{n})=>{
  n=n===10?10:1;
  return withProfile(uid,async(p,cards)=>{
   if(p.tickets<n)fail('tickets','Pas assez de tickets.');
   
   let pity=p.pity,gold=p.gold;const ids=[],places={...(p.places||{})},placeRes=[];
   for(let i=0;i<n;i++){
    pity++;
    if(pity<PITY&&Math.random()<PLACE_CHANCE){const pl=PLACES[Math.floor(Math.random()*PLACES.length)];
     if(places[pl.id]==null){places[pl.id]=0;placeRes.push({place:pl.id,kind:'new'});}else if(places[pl.id]<5){places[pl.id]++;placeRes.push({place:pl.id,kind:'star',stars:places[pl.id]});}else{gold+=300;placeRes.push({place:pl.id,kind:'gold',gold:300});}
     continue;}
    const r=pity>=PITY?'L':rollW(RATES,Math.random);if(r==='L')pity=0;ids.push(BYR[r][Math.floor(Math.random()*BYR[r].length)].id);
   }
   if(n===10&&ids.length&&ids.every(id=>CARD[id].r==='C'))ids[ids.length-1]=BYR.R[Math.floor(Math.random()*BYR.R.length)].id;
   const work=JSON.parse(JSON.stringify(cards)),changed={},results=[...placeRes],team=[...(p.team||[])];
   for(const id of ids){
    const o=work[id];
    if(!o){work[id]={lvl:1,stars:0};changed[id]=1;results.push({id,kind:'new'});if(team.length<5)team.push(id);}
    else if(o.stars<5){o.stars++;changed[id]=1;results.push({id,kind:'star',stars:o.stars});}
    else{gold+=300;results.push({id,kind:'gold',gold:300});}
   }
   const cs=collectionStats(work);
   const teams=teamsOf(p),ti=p.team_idx||0;teams[ti]={...teams[ti],ids:team};
   p=await commit(p,{tickets:p.tickets-n,pity,pulls:p.pulls+n,gold,team,teams,places,collection_score:cs.score,collection_count:cs.count});
   await upsertCards(uid,Object.keys(changed).map(id=>({id,...work[id]})));
   return full(uid,{results},p,work);
  });
 };

 A.levelup=async(uid,{card,n})=>withProfile(uid,async(p,cards)=>{
  const c=cards[card];if(!c)fail('card','Tu n\'as pas ce héros.');
  n=[1,5,10].includes(+n)?+n:1;let lvl=c.lvl,gold=p.gold,k=0;
  while(k<n&&gold>=levelCost(lvl)){gold-=levelCost(lvl);lvl++;k++;}
  if(!k)fail('gold','Pas assez d\'or.');
  p=await commit(p,{gold});
  const {error}=await db.from('cards').update({lvl}).eq('user_id',uid).eq('card_id',card).eq('lvl',c.lvl);if(error)throw error;
  cards[card]={...c,lvl};
  return full(uid,{levels:k},p,cards);
 });

 A.team=async(uid,{ids,kind,place,idx})=>withProfile(uid,async(p,cards)=>{
  
  if(!Array.isArray(ids)||ids.length>5||new Set(ids).size!==ids.length||ids.some(id=>!cards[id]))fail('team','Équipe invalide.');
  if(kind==='defense'){
   if(!ids.length)fail('team','La défense doit compter au moins un héros.');
   if(place&&(p.places||{})[place]==null)fail('place','Tu n\'as pas ce lieu.');
   p=await commit(p,{defense:ids,defense_place:place||null});return full(uid,{},p,cards);
  }
  const teams=teamsOf(p),ti=p.team_idx||0,k=idx==null?ti:Math.floor(+idx);
  if(!(k>=0&&k<MAX_TEAMS))fail('team','Équipe invalide.');
  teams[k]={...teams[k],ids};
  p=await commit(p,k===ti?{teams,team:ids}:{teams});
  return full(uid,{},p,cards);
 });
 A.team_select=async(uid,{idx})=>withProfile(uid,async(p,cards)=>{
  const teams=teamsOf(p),k=Math.floor(+idx);if(!(k>=0&&k<MAX_TEAMS))fail('team','Équipe invalide.');
  
  p=await commit(p,{teams,team_idx:k,team:teams[k].ids.filter(id=>cards[id])});
  return full(uid,{},p,cards);
 });
 A.team_meta=async(uid,{idx,name,place})=>withProfile(uid,async(p,cards)=>{
  const teams=teamsOf(p),k=Math.floor(+idx);if(!(k>=0&&k<MAX_TEAMS))fail('team','Équipe invalide.');
  if(name!=null){name=String(name).trim().slice(0,20);if(!name)fail('team','Nom vide.');teams[k].n=name;}
  if(place!==undefined){if(place&&(p.places||{})[place]==null)fail('place','Tu n\'as pas ce lieu.');teams[k].place=place||null;}
  p=await commit(p,{teams});
  return full(uid,{},p,cards);
 });
 /* Équipement */
 A.equip=async(uid,{item,card})=>withProfile(uid,async(p,cards)=>{
  if(!cards[card])fail('card','Tu n\'as pas ce héros.');
  const items=(p.items||[]).map(x=>({...x})),it=items.find(x=>x.u===item);if(!it)fail('item','Objet introuvable.');
  const slot=ITEM[it.id].slot;items.forEach(x=>{if(x.on===card&&x!==it&&ITEM[x.id].slot===slot)x.on=null;});it.on=card;
  p=await commit(p,{items});return full(uid,{},p,cards);
 });
 A.unequip=async(uid,{item})=>withProfile(uid,async(p,cards)=>{
  const items=(p.items||[]).map(x=>({...x})),it=items.find(x=>x.u===item);if(!it)fail('item','Objet introuvable.');
  it.on=null;p=await commit(p,{items});return full(uid,{},p,cards);
 });
 A.sell=async(uid,{items:list})=>withProfile(uid,async(p,cards)=>{
  if(!Array.isArray(list)||!list.length)fail('item','Rien à revendre.');
  const set=new Set(list);let gold=0;
  const items=(p.items||[]).filter(x=>{if(set.has(x.u)&&!x.on){gold+=SELL[x.r];return false;}return true;});
  p=await commit(p,{items,gold:p.gold+gold});return full(uid,{sold:gold},p,cards);
 });
 /* Donjons et farm continu */
 A.dungeon=async(uid,{kind,floor})=>withProfile(uid,async(p,cards)=>{
  if(!DUNGEONS[kind])fail('dungeon','Donjon inconnu.');
  const dg={gold:0,equip:0,...(p.dungeons||{})};floor=Math.floor(Number(floor));
  if(!(floor>=1&&floor<=dg[kind]+1))fail('floor','Étage non débloqué.');
  const wait=Date.parse(p.next_fight_at)-now();if(wait>300&&!p.is_admin)fail('cooldown','Combat précédent encore en cours.',{wait});
  const team=unitsOf(p.team,cards,p.items);if(!team.length)fail('team','Ton équipe est vide.');
  const place=placeOf(p,teamsOf(p)[p.team_idx||0].place);
  const enemies=genDungeon(kind,floor),seed=Math.floor(Math.random()*2147483647);
  const b=new Battle(team,enemies,seed,{placeA:place});while(!b.over)b.step();
  const win=b.winner===0,first=win&&floor>dg[kind];let gold=0,loot=[],patch={};
  if(win){
   if(kind==='gold')gold=Math.round(400*floor*(first?3:1)*goldBonus(p.team));
   else{gold=100*floor;loot.push(rollItem(floor,Math.random,first?'R':null));}
   if(first)dg[kind]=floor;
  }
  const add=addItems(p,loot);
  patch={gold:p.gold+gold+add.gold,items:add.items,item_seq:add.item_seq,dungeons:dg,next_fight_at:new Date(now()+Math.round(b.t*40/4*0.9)).toISOString()};
  if(first&&!p.farm){patch.farm={kind,floor};patch.last_collect=new Date(now()).toISOString();}
  const newItems=add.items.filter(x=>x.u>(p.item_seq||0));
  p=await commit(p,patch);
  return full(uid,{battle:{seed,kind,floor,team,enemies,place,win,gold,first,loot:newItems,sold:add.gold,ticks:b.t}},p,cards);
 });
 A.farm_set=async(uid,{kind,floor})=>withProfile(uid,async(p,cards)=>{
  if(!DUNGEONS[kind])fail('dungeon','Donjon inconnu.');
  const dg={gold:0,equip:0,...(p.dungeons||{})};floor=Math.floor(Number(floor));
  if(!(floor>=1&&floor<=dg[kind]))fail('floor','Bats d\'abord cet étage pour pouvoir le farmer.');
  const bank=farmBank(p,now(),Math.random),add=addItems(p,bank.items);
  const newItems=add.items.filter(x=>x.u>(p.item_seq||0));
  p=await commit(p,{gold:p.gold+bank.gold+add.gold,tickets:p.tickets+bank.tickets,items:add.items,item_seq:add.item_seq,farm:{kind,floor},last_collect:new Date(now()).toISOString()});
  return full(uid,{collected:{...bank,items:newItems,sold:add.gold}},p,cards);
 });
 A.collect=async uid=>withProfile(uid,async(p,cards)=>{
  const b=farmBank(p,now(),Math.random),add=addItems(p,b.items);
  const newItems=add.items.filter(x=>x.u>(p.item_seq||0));
  p=await commit(p,{gold:p.gold+b.gold+add.gold,tickets:p.tickets+b.tickets,items:add.items,item_seq:add.item_seq,last_collect:b.next});
  return full(uid,{collected:{...b,items:newItems,sold:add.gold}},p,cards);
 });

 A.fight=async(uid,{floor})=>withProfile(uid,async(p,cards)=>{
  floor=Math.floor(Number(floor));
  if(!(floor>=1&&floor<=p.max_floor+1))fail('floor','Étage non débloqué.');
  const wait=Date.parse(p.next_fight_at)-now();if(wait>300&&!p.is_admin)fail('cooldown','Combat précédent encore en cours.',{wait});
  const team=unitsOf(p.team,cards,p.items);if(!team.length)fail('team','Ton équipe est vide.');
  const place=placeOf(p,teamsOf(p)[p.team_idx||0].place);
  const enemies=genEnemies(floor),seed=Math.floor(Math.random()*2147483647);
  const b=new Battle(team,enemies,seed,{placeA:place});while(!b.over)b.step();
  const win=b.winner===0,gb=goldBonus(p.team);let gold=0,tickets=0,first=false;
  if(win){if(floor>p.max_floor){first=true;gold=Math.round((30+12*floor)*gb);tickets=1+(floor%5===0?5:0);}else{gold=Math.round((30+12*floor)*0.5*gb);if(Math.random()<0.15)tickets=1;}}
  const cooldownMs=Math.round(b.t*40/4*0.9);
  p=await commit(p,{gold:p.gold+gold,tickets:p.tickets+tickets,max_floor:first?floor:p.max_floor,next_fight_at:new Date(now()+cooldownMs).toISOString()});
  return full(uid,{battle:{seed,floor,team,enemies,place,win,gold,tickets,first,ticks:b.t}},p,cards);
 });

 A.pvp=async(uid,{target})=>{
  if(!target||target===uid)fail('target','Adversaire invalide.');
  const t=await getProfile(target);if(!t)fail('target','Adversaire introuvable.');
  if(t.is_admin)fail('target','Le compte admin ne participe pas à l\'arène.');
  return withProfile(uid,async(p,cards)=>{
   if(p.is_admin)fail('admin','Le compte admin ne participe pas à l\'arène, pour ne pas fausser les cotes.');
   const day=parisDay(now()),used=p.pvp_day===day?p.pvp_used:0;
   if(used>=PVP_PER_DAY)fail('pvp','Plus de combats PvP aujourd\'hui. Reviens demain.');
   const mine=cards,theirs=await getCards(target);
   const att=unitsOf(p.team,mine,p.items);if(!att.length)fail('team','Ton équipe est vide.');
   let def=unitsOf(t.defense,theirs,t.items),dplace=placeOf(t,t.defense_place);if(!def.length){def=unitsOf(t.team,theirs,t.items);dplace=placeOf(t,teamsOf(t)[t.team_idx||0].place);}if(!def.length)fail('target','Cet adversaire n\'a pas de défense.');
   const aplace=placeOf(p,teamsOf(p)[p.team_idx||0].place);
   const seed=Math.floor(Math.random()*2147483647),b=new Battle(att,def,seed,{placeA:aplace,placeB:dplace});while(!b.over)b.step();
   const win=b.winner===0,exp=1/(1+Math.pow(10,(t.pvp_rating-p.pvp_rating)/400)),delta=Math.round(32*((win?1:0)-exp));
   const gold=win?150:30;
   p=await commit(p,{pvp_rating:p.pvp_rating+delta,pvp_wins:p.pvp_wins+(win?1:0),pvp_losses:p.pvp_losses+(win?0:1),pvp_day:day,pvp_used:used+1,gold:p.gold+gold});
   for(let i=0;i<5;i++){const d=await getProfile(target);try{await commit(d,{pvp_rating:d.pvp_rating-delta});break;}catch(e){if(e.code!=='conflict')throw e;}}
   await db.from('pvp_log').insert({attacker:uid,defender:target,win,delta,seed});
   return full(uid,{battle:{seed,team:att,enemies:def,placeA:aplace,placeB:dplace,win,delta,gold,targetPseudo:t.pseudo}},p,cards);
  });
 };
 /* Outils réservés au compte admin, qui n'agissent que sur lui-même */
 const admin=f=>async(uid,body)=>withProfile(uid,async(p,cards)=>{if(!p.is_admin)fail('admin','Réservé au compte admin.');return f(uid,p,body||{},cards);});
 A.admin_grant=admin(async(uid,p,{gold,tickets},cards)=>{gold=Math.max(0,Math.min(1e7,Math.floor(+gold||0)));tickets=Math.max(0,Math.min(1000,Math.floor(+tickets||0)));p=await commit(p,{gold:p.gold+gold,tickets:p.tickets+tickets});return full(uid,{},p,cards);});
 A.admin_floor=admin(async(uid,p,{floor},cards)=>{floor=Math.max(0,Math.min(500,Math.floor(+floor||0)));p=await commit(p,{max_floor:floor});return full(uid,{},p,cards);});
 A.admin_card=admin(async(uid,p,{card,lvl,stars},cards)=>{if(!CARD[card])fail('card','Héros inconnu.');cards[card]={lvl:Math.max(1,Math.min(300,Math.floor(+lvl||1))),stars:Math.max(0,Math.min(5,Math.floor(+stars||0)))};const cs=collectionStats(cards);p=await commit(p,{collection_score:cs.score,collection_count:cs.count});await upsertCards(uid,[{id:card,...cards[card]}]);return full(uid,{},p,cards);});
 A.admin_all=admin(async(uid,p,{lvl})=>{lvl=Math.max(1,Math.min(300,Math.floor(+lvl||1)));const cards={};CARDS.forEach(c=>cards[c.id]={lvl,stars:0});const cs=collectionStats(cards);p=await commit(p,{collection_score:cs.score,collection_count:cs.count});await upsertCards(uid,CARDS.map(c=>({id:c.id,lvl,stars:0})));return full(uid,{},p,cards);});
 A.admin_dungeon=admin(async(uid,p,{kind,floor},cards)=>{if(!DUNGEONS[kind])fail('dungeon','Donjon inconnu.');floor=Math.max(0,Math.min(50,Math.floor(+floor||0)));const dg={gold:0,equip:0,...(p.dungeons||{})};dg[kind]=floor;p=await commit(p,{dungeons:dg});return full(uid,{},p,cards);});
 A.admin_loot=admin(async(uid,p,{r},cards)=>{r=IRAR[r]?r:'C';const add=addItems(p,ITEMS.map(i=>({id:i.id,r})));const places={...(p.places||{})};PLACES.forEach(pl=>{if(places[pl.id]==null)places[pl.id]=0;});p=await commit(p,{items:add.items,item_seq:add.item_seq,places,gold:p.gold+add.gold});return full(uid,{},p,cards);});
 A.admin_time=admin(async(uid,p,{hours},cards)=>{hours=Math.max(0,Math.min(48,+hours||0));p=await commit(p,{last_collect:new Date(Date.parse(p.last_collect)-hours*3600e3).toISOString()});return full(uid,{},p,cards);});
 A.admin_reset=admin(async(uid,p)=>{const {error}=await db.from('cards').delete().eq('user_id',uid).neq('card_id',p.legend);if(error)throw error;await db.from('cards').update({lvl:1,stars:0}).eq('user_id',uid).eq('card_id',p.legend);const cs=collectionStats({[p.legend]:{lvl:1,stars:0}});p=await commit(p,{gold:START_GOLD,tickets:START_TICKETS,max_floor:0,pity:0,pulls:0,team:[p.legend],defense:[p.legend],defense_place:null,teams:teamsOf({team:[p.legend]}),team_idx:0,items:[],item_seq:0,places:{},dungeons:{gold:0,equip:0},farm:null,collection_score:cs.score,collection_count:cs.count,last_collect:new Date(now()).toISOString()});return full(uid);});
 return A;
}


const db = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
const GAME = makeGame(db);
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
// Jetons déjà vérifiés : on évite un aller-retour vers le service d'authentification à chaque clic
const AUTH = new Map();
async function userOf(token) {
  if (!token) return null;
  const c = AUTH.get(token);
  if (c && c.exp > Date.now() / 1000 + 5) return c.uid;
  let uid = null, exp = 0;
  try {
    if (db.auth.getClaims) {
      const { data, error } = await db.auth.getClaims(token);
      if (!error && data && data.claims && data.claims.sub) { uid = data.claims.sub; exp = data.claims.exp || 0; }
    }
  } catch (_) {}
  if (!uid) {
    const { data, error } = await db.auth.getUser(token);
    if (error || !data || !data.user) return null;
    uid = data.user.id;
    try { exp = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).exp; } catch (_) { exp = Date.now() / 1000 + 300; }
  }
  if (AUTH.size > 500) AUTH.clear();
  AUTH.set(token, { uid, exp });
  return uid;
}
const reply = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const [uid, body] = await Promise.all([userOf(token), req.json().catch(() => ({}))]);
    if (!uid) return reply({ error: "auth", message: "Connexion requise." }, 401);
    const fn = GAME[body.action];
    if (!fn) return reply({ error: "bad", message: "Action inconnue." }, 400);
    return reply(await fn(uid, body));
  } catch (e) {
    if (e && e.code && e instanceof GameError) return reply({ error: e.code, message: e.message, ...(e.extra || {}) }, 400);
    console.error(e);
    return reply({ error: "server", message: "Erreur du serveur, réessaie." }, 500);
  }
});
