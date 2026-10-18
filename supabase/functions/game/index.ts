// @ts-nocheck
// Gacha entre potes : serveur de jeu (Supabase Edge Function « game »).
// Fichier généré : moteur de combat + règles du jeu. Ne pas modifier à la main.
import { createClient } from "npm:@supabase/supabase-js@2";


const EL={coeur:{n:'Cœur',b:'raison'},raison:{n:'Raison',b:'delire'},delire:{n:'Délire',b:'prudence'},prudence:{n:'Prudence',b:'coeur'},ordre:{n:'Ordre',b:'chaos'},chaos:{n:'Chaos',b:'ordre'}};
const RAR={C:{n:'Commune',w:60},R:{n:'Rare',w:28},E:{n:'Épique',w:9},L:{n:'Légendaire',w:3}};
const FAM={soirees:'Les Soirées jeu',lol:'League of Legends',potes:'Les Potes',foyer:'Le Foyer',chezk:'Chez Kylian',jl:'Jenlain & Lila',lignee:'Lignée de Yuumi',bruyants:'Les Bruyants',lents:'Les Lents',paperasse:'La Paperasse',argent:"L'Argent",sante:'La Santé',poste:'La Poste',boulot:'Le Boulot',matin:'Le Matin',numerique:'Le Numérique',relous:'Les Relous',nuisibles:'Les Nuisibles',corvee:'La Corvée',quotidien:'Le Quotidien'};
const SYN={soirees:[[3,'+15 % VIT']],lol:[[2,'+10 % ATK'],[3,'+10 % ATK et Bouclier au début']],potes:[[3,'+10 % ATK'],[5,'+25 % ATK']],foyer:[[2,'Quand un membre tombe, les autres gagnent 2 Colère']],chezk:[[2,"+15 % d'or"],[3,"+30 % d'or"]],jl:[[2,'Entrée fracassante +50 %']],lignee:[[2,"Câlin sur toute l'équipe au début"]],bruyants:[[2,'Malaise plus long']],lents:[[2,'+20 % PV'],[3,'+40 % PV']],paperasse:[[2,'États négatifs plus longs']],argent:[[2,"+15 % d'or"]],sante:[[2,'Soins +30 %']],poste:[[2,'+20 % VIT']],boulot:[[2,'Stress plus douloureux']],matin:[[2,'Flemme sur les ennemis au début']],numerique:[[2,'En attente plus long']],relous:[[2,'Stress sur un ennemi au début']],nuisibles:[[2,'+10 % esquive']],corvee:[[2,'+15 % PV'],[4,'+30 % PV']],quotidien:[[3,'+10 % ATK'],[5,'+20 % ATK']]};

const CARDS=[
{id:'jenlain',name:'Jenlain',r:'L',el:'delire',fam:['potes','jl'],hp:110,atk:120,spd:70,kit:[['Attaque','Punchline','Frappe une cible.'],['Passif','Retardataire','Arrive après 3 actions alliées, avec une entrée fracassante.'],['Compétence','Freestyle','Frappe tous les ennemis, plus fort à chaque utilisation.'],['Ulti','Concert',"À charger. Frappe tous les ennemis et donne Hype à toute l'équipe."]]},
{id:'yoann',name:'Yoann',r:'L',el:'raison',fam:['potes','foyer'],hp:160,atk:80,spd:70,kit:[['Attaque','Coup sec','Frappe une cible.'],['Passif','Caillou',"Immunisé à l'Angoisse, au Malaise et au Stress."],['Compétence','Regard vide','Provocation, puis frappe.'],['Ulti','Inébranlable','Une fois par combat : quand il devrait tomber, il reste à 1 PV et gagne un gros Bouclier.']]},
{id:'lea',name:'Léa',r:'L',el:'coeur',fam:['potes','foyer'],hp:100,atk:110,spd:90,kit:[['Attaque','Remise en place','Frappe une cible.'],['Passif','Faut pas me chercher','Gagne Colère à chaque coup reçu.'],['Compétence','Tu lui as fait quoi ?!',"Frappe l'ennemi qui vient de blesser un allié, plus fort selon sa Colère."],['Ulti','Explosion','À charger. Consomme sa Colère pour frapper tous les ennemis.']]},
{id:'kylian',name:'Kylian',r:'L',el:'prudence',fam:['potes','chezk'],hp:90,atk:90,spd:100,kit:[['Attaque','Investissement','Frappe une cible.'],['Passif','Économe','Une partie de ses dégâts remplit une cagnotte.'],['Compétence',"C'est à moi",'Vole un état positif à un ennemi.'],['Ulti','Rentabiliser',"À charger. Vide la cagnotte en Bouclier pour toute l'équipe."]]},
{id:'geoffrey',name:'Geoffrey',r:'L',el:'delire',fam:['potes','bruyants'],hp:120,atk:70,spd:110,kit:[['Attaque','Blague nulle','Frappe une cible.'],['Passif','Aucune honte',"Immunisé au Malaise et à l'Angoisse. Gagne Hype quand un ennemi tombe en Malaise."],['Compétence','Rire strident','Malaise sur tous les ennemis, et une chance sur trois sur chaque allié (sauf Yoann).'],['Ulti','La blague de trop','À charger. Malaise long sur tout le terrain sauf lui et Yoann ; il frappe deux fois plus fort pendant ce temps.']]},
{id:'lila',name:'Lila',r:'L',el:'coeur',fam:['potes','jl'],hp:100,atk:100,spd:70,kit:[['Attaque','Petite frappe','Frappe une cible.'],['Passif','Arrive en douce',"Retardataire, et Discrétion tant qu'un allié est debout."],['Compétence','Faut pas pousser','Gagne Colère et frappe fort.'],['Ulti','Plus du tout timide',"Une fois : quand un allié tombe, elle perd sa Discrétion et gagne +60 % d'ATK."]]},
{id:'ryuk',name:'Ryuk',r:'E',el:'chaos',fam:['foyer','lignee'],hp:80,atk:110,spd:150,kit:[['Attaque','Griffe','Frappe une cible au hasard.'],['Passif','Zoomies',"Chance de rejouer jusqu'à 2 fois d'affilée."],['Compétence','Connerie','Effet aléatoire : renverse un verre (Malaise), fait tomber un objet (dégâts à tous), ou se coince quelque part.']]},
{id:'yuumi',name:'Yuumi',r:'E',el:'coeur',fam:['foyer','lignee'],hp:90,atk:40,spd:80,kit:[['Attaque','Coup de patte','Frappe une cible.'],['Passif','Froussarde','Quand elle est touchée, elle se cache un court moment.'],['Compétence','Papouilles',"Câlin sur l'allié le plus blessé."]]},
{id:'traffy',name:'Traffy',r:'E',el:'prudence',fam:['chezk','lents'],hp:200,atk:60,spd:20,kit:[['Attaque','Gros dodo sur toi','Frappe une cible.'],['Passif','Pas pressé','+10 % à ses stats à chacune de ses actions.'],['Compétence','Sieste','Se donne Zen et un Bouclier.']]},
{id:'echo',name:'Echo',r:'E',el:'coeur',fam:['chezk','lignee'],hp:90,atk:80,spd:100,kit:[['Attaque','Coup de patte','Frappe une cible.'],['Passif','Miaou de protestation','Renvoi : renvoie les états négatifs à l\'envoyeur.'],['Compétence','Câlin','Câlin sur un allié blessé.']]},
{id:'zoya',name:'Zoya',r:'E',el:'prudence',fam:['foyer','lents'],hp:180,atk:70,spd:10,kit:[['Attaque','Morsure','Frappe une cible ; ×3 contre les Nuisibles.'],['Passif','Bronzette','Gagne régulièrement un Bouclier.'],['Compétence','Croque-souris',"Grosse morsure sur l'ennemi le plus faible ; récupère des PV si elle l'achève."]]},
{id:'impots',name:'Les Impôts',r:'R',el:'ordre',fam:['paperasse','argent'],hp:140,atk:80,spd:60,kit:[['Attaque','Ponction','Frappe une cible.'],['Passif','Prélèvement à la source','Soigne son équipe avec une partie de ses dégâts ; +50 % contre Kylian.']]},
{id:'assurance',name:"L'Assurance maladie",r:'R',el:'ordre',fam:['paperasse','sante'],hp:120,atk:70,spd:60,kit:[['Attaque','Pièce manquante','Frappe et annule le prochain soin de la cible.'],['Passif','Dossier en cours','Les soins reçus par son équipe arrivent en retard, mais doublés.']]},
{id:'proprio',name:'Le Proprio',r:'R',el:'ordre',fam:['paperasse','argent'],hp:140,atk:90,spd:60,kit:[['Attaque','Relance','Frappe une cible.'],['Passif','Loyer','Toutes les 3 actions, dégâts à tous les ennemis, sauf Kylian.']]},
{id:'caf',name:'La CAF',r:'R',el:'chaos',fam:['paperasse','argent'],hp:100,atk:90,spd:90,kit:[['Attaque','Versement','Dégâts aléatoires, de presque rien à énorme.'],['Passif','Montant variable','Donne un état positif au hasard à un allié ; parfois Trop-perçu, qui en retire un.']]},
{id:'file',name:"La File d'attente",r:'R',el:'prudence',fam:['paperasse','lents'],hp:120,atk:60,spd:70,kit:[['Attaque','Prenez un ticket','Frappe une cible.'],['Passif','Veuillez patienter',"En attente sur l'ennemi le plus rapide en début de combat."]]},
{id:'recommande',name:'Le Recommandé',r:'R',el:'raison',fam:['paperasse','poste'],hp:90,atk:110,spd:90,kit:[['Attaque','Avis de passage','Frappe une cible.'],['Passif','Toujours délivré','Ignore Bouclier et Discrétion.']]},
{id:'lundi',name:'Le Lundi matin',r:'R',el:'raison',fam:['boulot','matin'],hp:120,atk:80,spd:70,kit:[['Attaque','Réveil difficile','Frappe une cible.'],['Passif','Reprise',"Flemme sur toute l'équipe ennemie en début de combat."]]},
{id:'service',name:'Le Service client',r:'R',el:'prudence',fam:['boulot','lents'],hp:120,atk:60,spd:90,kit:[['Attaque','Votre appel est important','Frappe une cible.'],['Passif',"Musique d'attente",'Ses attaques peuvent mettre En attente.']]},
{id:'bug',name:'Le Bug en prod',r:'R',el:'chaos',fam:['boulot','numerique'],hp:80,atk:110,spd:110,kit:[['Attaque','Erreur 500','Frappe une cible au hasard.'],['Passif','Comportement inattendu','Effet aléatoire à chaque action ; rate plus souvent contre Kylian.']]},
{id:'collegue',name:'Le Collègue chiant',r:'R',el:'coeur',fam:['boulot','relous'],hp:120,atk:70,spd:90,kit:[['Attaque','T\'as deux minutes ?','Frappe et applique Stress.'],['Passif','Pot de colle',"Sa dernière cible a Flemme tant qu'il est en vie."]]},
{id:'chef',name:'Le Chef incompétent',r:'R',el:'delire',fam:['boulot','relous'],hp:130,atk:90,spd:70,kit:[['Attaque','Directive floue','Frappe une cible.'],['Passif','Ordre absurde','Fait régulièrement agir un allié tout de suite, sur une cible au hasard (même dans son camp).']]},
{id:'souris',name:'La Souris',r:'C',el:'prudence',fam:['quotidien','nuisibles'],hp:60,atk:60,spd:140,kit:[['Attaque','Grignotage','Petits dégâts. Esquive élevée.']]},
{id:'moustique',name:'Le Moustique',r:'C',el:'delire',fam:['nuisibles','relous'],hp:50,atk:70,spd:150,kit:[['Attaque','Piqûre','Petits dégâts et Stress.']]},
{id:'linge',name:'Le Linge sale',r:'C',el:'delire',fam:['quotidien','corvee'],hp:140,atk:40,spd:40,kit:[['Attaque','Odeur suspecte','Frappe et gagne des PV max.']]},
{id:'vaisselle',name:'La Vaisselle',r:'C',el:'raison',fam:['quotidien','corvee'],hp:90,atk:80,spd:80,kit:[['Attaque',"Pile qui s'effondre",'Dégâts qui augmentent à chaque utilisation.']]},
{id:'aspirateur',name:"L'Aspirateur",r:'C',el:'delire',fam:['corvee','bruyants'],hp:100,atk:70,spd:80,kit:[['Attaque','Vrombissement','Frappe ; Angoisse si la cible est un animal.']]},
{id:'chaussette',name:'La Chaussette orpheline',r:'C',el:'coeur',fam:['quotidien','corvee'],hp:70,atk:70,spd:90,kit:[['Attaque','Coup de chaussette',"Dégâts doublés si c'est la seule carte du Quotidien de l'équipe."]]},
{id:'veto',name:'Le Véto',r:'C',el:'raison',fam:['quotidien','sante'],hp:110,atk:70,spd:70,kit:[['Attaque','Vaccin',"Frappe et soigne un peu l'allié le plus blessé."]]},
{id:'reveil',name:'Le Réveil',r:'C',el:'raison',fam:['matin','bruyants'],hp:70,atk:80,spd:100,kit:[['Attaque','Sonnerie','Dégâts doublés contre les Retardataires.']]},
{id:'embouteillages',name:'Les Embouteillages',r:'C',el:'prudence',fam:['matin','lents'],hp:130,atk:50,spd:40,kit:[['Attaque','Bouchon','Frappe et applique Flemme.']]},
{id:'wifi',name:'La Coupure de wifi',r:'C',el:'delire',fam:['quotidien','numerique'],hp:80,atk:70,spd:110,kit:[['Attaque','Déconnexion','Frappe et met En attente.']]},
{id:'messagevu',name:'Le Message vu sans réponse',r:'C',el:'coeur',fam:['quotidien','numerique'],hp:80,atk:80,spd:90,kit:[['Attaque','Vu à 23 h 42','Frappe et applique Angoisse.']]},
{id:'facture',name:'La Facture',r:'C',el:'raison',fam:['quotidien','argent'],hp:90,atk:90,spd:70,kit:[['Attaque','Échéance','Frappe et applique Déprime.']]},
{id:'udyr',name:'Udyr',r:'E',el:'delire',fam:['soirees','lol'],hp:150,atk:110,spd:90,kit:[['Attaque','Coup de griffe','Frappe une cible.'],['Passif','Postures','Alterne à chaque action : posture offensive (gagne Colère) puis défensive (gagne un Bouclier).'],['Compétence',"Charge de l'ours",'Frappe fort et met la cible en Malaise.']]},
{id:'ekko',name:'Ekko',r:'E',el:'raison',fam:['soirees','lol'],hp:100,atk:105,spd:110,kit:[['Attaque','Batte temporelle','Frappe une cible ; une attaque sur trois frappe deux fois et donne Hype.'],['Passif','Résonance','Se souvient de ses PV des dernières actions.'],['Compétence','Retour en arrière',"Récupère les PV qu'il avait trois actions plus tôt et frappe tous les ennemis."]]},
{id:'thresh',name:'Thresh',r:'E',el:'chaos',fam:['soirees','lol'],hp:160,atk:80,spd:70,kit:[['Attaque','Fléau','Frappe une cible.'],['Passif','Damnation',"Chaque ennemi K.O. lui donne +6 % d'ATK et +5 % de PV max."],['Compétence','Lanterne',"Bouclier sur l'allié le plus blessé et Malaise sur un ennemi."]]},
{id:'colis',name:'Le Colis introuvable',r:'C',el:'delire',fam:['quotidien','poste'],hp:80,atk:100,spd:80,kit:[['Attaque','Livré chez le voisin','Gros dégâts sur une cible au hasard.']]}
];
const CARD={}; CARDS.forEach((c,i)=>{c.no=i+1;CARD[c.id]=c;});
const BYR={C:[],R:[],E:[],L:[]}; CARDS.forEach(c=>BYR[c.r].push(c));
const RETARD=new Set(['jenlain','lila']);
const ANIMALS=new Set(['ryuk','yuumi','traffy','echo','zoya']);
const CHARGE=new Set(['jenlain','lea','kylian','geoffrey']);
const SKILL_CD={udyr:3,ekko:3,thresh:3,jenlain:3,yoann:3,lea:3,kylian:3,geoffrey:3,lila:3,ryuk:3,yuumi:2,traffy:4,echo:3,zoya:3};
const NEG=new Set(['angoisse','malaise','flemme','stress','deprime','attente','piece']);
const ST_LABEL={angoisse:'Angoisse',malaise:'Malaise',flemme:'Flemme',stress:'Stress',deprime:'Déprime',attente:'En attente',piece:'Pièce manq.',hype:'Hype',zen:'Zen',calin:'Câlin',provoc:'Provoc.',cachee:'Cachée',double:'×2'};
const rnd=n=>Math.floor(Math.random()*n);
const statMult=(lvl,stars)=>(1+0.12*(lvl-1))*(1+0.2*stars);
const elemMult=(a,d)=>EL[a].b===d?1.25:1;
function famCounts(ids){const c={};[...new Set(ids)].forEach(id=>CARD[id].fam.forEach(f=>c[f]=(c[f]||0)+1));return c;}
function synTier(f,n){let t=-1;(SYN[f]||[]).forEach((s,i)=>{if(n>=s[0])t=i;});return t;}
function goldBonus(ids){const c=famCounts(ids);let b=1;if((c.chezk||0)>=3)b+=0.30;else if((c.chezk||0)>=2)b+=0.15;if((c.argent||0)>=2)b+=0.15;return b;}

const B1=m=>(b,u)=>{const t=b.pick(u);if(t)b.hit(u,t,m);return t;};
const KIT={
 jenlain:{atk:B1(1),skill(b,u){u.uses++;b.say(`${b.nm(u)} lance un Freestyle.`);b.foes(u).forEach(t=>b.hit(u,t,0.5+0.1*u.uses));},ult(b,u){b.say(`${b.nm(u)} donne un Concert !`,'ult');b.foes(u).forEach(t=>b.hit(u,t,1));b.allies(u).forEach(a=>b.apply(u,a,'hype',50));}},
 yoann:{atk:B1(1),skill(b,u){b.say(`${b.nm(u)} fixe le vide. Tout le monde le regarde.`);b.apply(u,u,'provoc',40);B1(0.8)(b,u);}},
 lea:{atk:B1(1),skill(b,u){let t=b.sides[u.side].lastAttacker;if(!t||!t.alive||!t.present||t.side===u.side)t=b.pick(u);if(!t)return;b.say(`${b.nm(u)} : « Tu lui as fait quoi ?! »`);b.hit(u,t,1+0.2*u.colere);},ult(b,u){b.say(`${b.nm(u)} explose (${u.colere} Colère).`,'ult');const m=0.6+0.25*u.colere;u.colere=0;b.foes(u).forEach(t=>b.hit(u,t,m));}},
 kylian:{atk:B1(1),skill(b,u){const fs=b.foes(u).filter(t=>t.st.hype||t.st.zen||t.st.calin||t.colere>0||t.shield>0);if(!fs.length){B1(1)(b,u);return;}const t=fs[b.rnd(fs.length)];let w;if(t.st.zen){u.st.zen=t.st.zen;delete t.st.zen;w='Zen';}else if(t.st.hype){u.st.hype=t.st.hype;delete t.st.hype;w='Hype';}else if(t.st.calin){u.st.calin=t.st.calin;delete t.st.calin;w='Câlin';}else if(t.colere>0){u.colere=Math.min(10,u.colere+t.colere);t.colere=0;w='sa Colère';}else{u.shield+=t.shield;t.shield=0;w='son Bouclier';}b.say(`${b.nm(u)} : « C'est à moi. » Il prend ${w} à ${b.nm(t)}.`);},ult(b,u){const v=Math.max(20,Math.round(u.cagnotte*0.4));b.say(`${b.nm(u)} rentabilise : Bouclier de ${v} pour l'équipe.`,'ult');b.allies(u).forEach(a=>{a.shield+=v;b.ev(a,'+'+v+' bouclier','pos');});u.cagnotte=0;}},
 geoffrey:{atk:B1(1),skill(b,u){b.say(`${b.nm(u)} éclate de rire. Malaise général.`);b.foes(u).forEach(t=>b.apply(u,t,'malaise',20));b.allies(u).forEach(a=>{if(a!==u&&b.rand()<1/3)b.apply(u,a,'malaise',20);});},ult(b,u){b.say(`${b.nm(u)} sort LA blague de trop.`,'ult');b.units.filter(x=>x.alive&&x.present&&x!==u).forEach(x=>b.apply(u,x,'malaise',40));b.apply(u,u,'double',40);}},
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
 thresh:{atk:B1(1),skill(b,u){const a=b.mostHurt(u),v=Math.round(u.maxhp*0.2);a.shield+=v;b.ev(a,'+'+v+' bouclier','pos');const t=b.pick(u);b.say(`${b.nm(u)} tend sa lanterne.`);if(t)b.apply(u,t,'malaise',15);}}
};
const AFTER={
 traffy(b,u){u.stacks=Math.min(15,u.stacks+1);},
 zoya(b,u){if(u.acts%2===0){u.shield+=Math.round(u.maxhp*0.15);b.ev(u,'Bronzette','pos');}},
 proprio(b,u){if(u.acts%3===0){b.say(`${b.nm(u)} réclame le loyer.`);b.foes(u).filter(t=>t.id!=='kylian').forEach(t=>b.hit(u,t,0.5));}},
 caf(b,u){const as=b.allies(u);if(!as.length)return;if(b.rand()<0.2){const w=as.filter(a=>a.st.hype||a.st.zen||a.st.calin||a.colere>0||a.shield>0);if(!w.length)return;const a=w[b.rnd(w.length)];if(a.st.hype)delete a.st.hype;else if(a.st.zen)delete a.st.zen;else if(a.st.calin)delete a.st.calin;else if(a.colere>0)a.colere--;else a.shield=0;b.say(`${b.nm(u)} réclame un trop-perçu à ${b.nm(a)}.`);b.ev(a,'Trop-perçu','neg');return;}const a=as[b.rnd(as.length)];const r=b.rnd(5);if(r===0)b.apply(u,a,'hype',40);else if(r===1)b.apply(u,a,'zen',30);else if(r===2)b.apply(u,a,'calin',40);else if(r===3){a.colere=Math.min(10,a.colere+1);b.ev(a,'Colère','pos');}else{const v=Math.round(a.maxhp*0.1);a.shield+=v;b.ev(a,'+'+v+' bouclier','pos');}},
 chef(b,u){if(u.acts%3===0){const as=b.allies(u).filter(x=>x!==u);if(!as.length)return;const a=as[b.rnd(as.length)];a.gauge=1000;a.confused=true;b.say(`${b.nm(u)} donne un ordre absurde à ${b.nm(a)}.`);}},
 udyr(b,u){if(u.acts%2){u.colere=Math.min(10,u.colere+1);b.ev(u,'Posture offensive','pos');}else{const v=Math.round(u.maxhp*0.08);u.shield+=v;b.ev(u,'Posture défensive','pos');}},
 ekko(b,u){u.hist=(u.hist||[]).concat([u.hp]).slice(-3);},
 bug(b,u){const r=b.rand();if(r<0.25){const t=b.pick(u);if(t){b.say(`${b.nm(u)} fait planter ${b.nm(t)}.`);b.apply(u,t,'malaise',15);}}else if(r<0.5){b.apply(u,u,'hype',30);}else if(r<0.65){const as=b.allies(u).filter(x=>x!==u);if(as.length){const a=as[b.rnd(as.length)];b.say(`${b.nm(u)} touche sa propre équipe.`);b.hit(u,a,0.5);}}}
};

class Battle{
 constructor(teamA,teamB,seed){
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
   us.forEach(u=>{u.atkMul*=atk;u.maxhp=Math.round(u.maxhp*hp);u.hp=u.maxhp;u.spdMul*=spd;u.dodge+=dodge;u.alone=u.id==='chaussette'&&us.filter(x=>x.d.fam.includes('quotidien')).length===1;});
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
  });
 }
 add(c,side){
  const d=CARD[c.id],m=statMult(c.lvl||1,c.stars||0);
  const u={uid:this.units.length,id:c.id,d,side,lvl:c.lvl||1,stars:c.stars||0,maxhp:Math.round(d.hp*8*m),atk0:d.atk*m,spd0:d.spd,hp:0,gauge:RETARD.has(c.id)?0:100+this.rand()*450,alive:true,present:!RETARD.has(c.id),st:{},colere:0,shield:0,cd:2,charge:0,uses:0,acts:0,atkMul:1,spdMul:1,dodge:c.id==='souris'?0.25:0,immune:new Set(c.id==='yoann'?['angoisse','malaise','stress']:c.id==='geoffrey'?['malaise','angoisse']:[]),once:false,discreet:c.id==='lila',cagnotte:0,stacks:0,confused:false,colle:null,alone:false};
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
   if(name==='malaise')this.units.filter(x=>x.id==='geoffrey'&&x.side!==t.side&&x.alive).forEach(g=>{g.st.hype={t:30};});
  }
  const cur=t.st[name];
  t.st[name]={t:Math.max(cur?cur.t:0,Math.round(dur)),src:s,mul:(name==='stress'&&s&&(this.sides[s.side].syn.boulot||0)>=2)?1.5:1};
  this.ev(t,ST_LABEL[name],NEG.has(name)?'neg':'pos');return true;
 }
 arrivals(){
  [0,1].forEach(s=>{
   const side=this.sides[s],abs=this.units.filter(u=>u.side===s&&u.alive&&!u.present);if(!abs.length)return;
   const none=!this.units.some(u=>u.side===s&&u.alive&&u.present);
   if(side.actions>=3||none){
    const jl=(side.syn.jl||0)>=2;
    abs.forEach(u=>{u.present=true;u.gauge=0;this.say(`${this.nm(u)} arrive enfin${jl?' avec sa moitié':''}.`);const t=this.pick(u);if(t)this.hit(u,t,1.2*(jl?1.5:1));});
   }
  });
 }
 act(u,depth=0){
  if(!u.alive||!u.present||this.over)return;
  this.sides[u.side].actions++;
  const k=KIT[u.id]||{atk:B1(1)};let kind='atk';
  if(CHARGE.has(u.id)&&u.charge>=100){kind='ult';u.charge=0;}
  else if(SKILL_CD[u.id]&&u.cd<=0){kind='skill';u.cd=SKILL_CD[u.id];}
  if(kind!=='atk'){const kk=u.d.kit.find(x=>x[0]===(kind==='ult'?'Ulti':'Compétence'));this.fx.push({k:'act',uid:u.uid,name:kk?kk[1]:''});}
  (k[kind]||k.atk)(this,u);
  u.cd--;u.acts++;this.lastActor=u.uid;
  if(CHARGE.has(u.id)&&kind!=='ult')u.charge=Math.min(100,u.charge+20);
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
const START_GOLD=500,START_TICKETS=10,PITY=60,PVP_PER_DAY=5,IDLE_CAP_S=12*3600,TICKET_EVERY_S=900;
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
function idleBank(p,nowMs){
 if(!p.max_floor)return {gold:0,tickets:0};
 const dt=Math.min(IDLE_CAP_S,Math.max(0,(nowMs-Date.parse(p.last_collect))/1000));
 const rate=(1+p.max_floor*0.5)*goldBonus(p.team||[]);
 return {gold:Math.floor(rate*dt),tickets:Math.floor(dt/TICKET_EVERY_S)};
}
function parisDay(ms){return new Intl.DateTimeFormat('fr-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ms));}
const unitsOf=(ids,cards)=>(ids||[]).filter(id=>cards[id]).map(id=>({id,lvl:cards[id].lvl,stars:cards[id].stars}));

function makeGame(db,now=()=>Date.now()){
 async function getProfile(uid){const {data,error}=await db.from('profiles').select('*').eq('id',uid).maybeSingle();if(error)throw error;return data;}
 async function getCards(uid){const {data,error}=await db.from('cards').select('card_id,lvl,stars').eq('user_id',uid);if(error)throw error;const o={};(data||[]).forEach(c=>{o[c.card_id]={lvl:c.lvl,stars:c.stars};});return o;}
 async function commit(p,patch){
  const {data,error}=await db.from('profiles').update({...patch,version:p.version+1}).eq('id',p.id).eq('version',p.version).select('*').maybeSingle();
  if(error)throw error;if(!data)fail('conflict','Une autre action était en cours, réessaie.');return data;
 }
 async function withProfile(uid,f){
  for(let i=0;;i++){
   const p=await getProfile(uid);if(!p)fail('noprofile','Crée d\'abord ton profil.');
   try{return await f(p);}catch(e){if(e.code==='conflict'&&i<3)continue;throw e;}
  }
 }
 async function upsertCards(uid,list){
  if(!list.length)return;
  const {error}=await db.from('cards').upsert(list.map(c=>({user_id:uid,card_id:c.id,lvl:c.lvl,stars:c.stars})),{onConflict:'user_id,card_id'});
  if(error)throw error;
 }
 async function full(uid,extra={}){
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
  const {error}=await db.from('profiles').insert({id:uid,pseudo,legend,gold:START_GOLD,tickets:START_TICKETS,team:[legend],defense:[legend],collection_score:cs.score,collection_count:cs.count,last_collect:new Date(now()).toISOString(),next_fight_at:new Date(now()).toISOString()});
  if(error){if(String(error.code)==='23505')fail('pseudo','Ce pseudo est déjà pris.');throw error;}
  await upsertCards(uid,[{id:legend,lvl:1,stars:0}]);
  return full(uid);
 };

 A.pull=async(uid,{n})=>{
  n=n===10?10:1;
  return withProfile(uid,async p=>{
   if(p.tickets<n)fail('tickets','Pas assez de tickets.');
   const cards=await getCards(uid);
   let pity=p.pity,gold=p.gold;const ids=[];
   for(let i=0;i<n;i++){pity++;const r=pity>=PITY?'L':rollW(RATES,Math.random);if(r==='L')pity=0;ids.push(BYR[r][Math.floor(Math.random()*BYR[r].length)].id);}
   if(n===10&&ids.every(id=>CARD[id].r==='C'))ids[9]=BYR.R[Math.floor(Math.random()*BYR.R.length)].id;
   const work=JSON.parse(JSON.stringify(cards)),changed={},results=[],team=[...(p.team||[])];
   for(const id of ids){
    const o=work[id];
    if(!o){work[id]={lvl:1,stars:0};changed[id]=1;results.push({id,kind:'new'});if(team.length<5)team.push(id);}
    else if(o.stars<5){o.stars++;changed[id]=1;results.push({id,kind:'star',stars:o.stars});}
    else{gold+=300;results.push({id,kind:'gold',gold:300});}
   }
   const cs=collectionStats(work);
   await commit(p,{tickets:p.tickets-n,pity,pulls:p.pulls+n,gold,team,collection_score:cs.score,collection_count:cs.count});
   await upsertCards(uid,Object.keys(changed).map(id=>({id,...work[id]})));
   return full(uid,{results});
  });
 };

 A.levelup=async(uid,{card})=>withProfile(uid,async p=>{
  const cards=await getCards(uid),c=cards[card];if(!c)fail('card','Tu n\'as pas ce héros.');
  const cost=levelCost(c.lvl);if(p.gold<cost)fail('gold','Pas assez d\'or.');
  await commit(p,{gold:p.gold-cost});
  const {error}=await db.from('cards').update({lvl:c.lvl+1}).eq('user_id',uid).eq('card_id',card).eq('lvl',c.lvl);if(error)throw error;
  return full(uid);
 });

 A.team=async(uid,{ids,kind})=>withProfile(uid,async p=>{
  const cards=await getCards(uid);
  if(!Array.isArray(ids)||ids.length>5||new Set(ids).size!==ids.length||ids.some(id=>!cards[id]))fail('team','Équipe invalide.');
  if(kind==='defense'&&!ids.length)fail('team','La défense doit compter au moins un héros.');
  await commit(p,kind==='defense'?{defense:ids}:{team:ids});
  return full(uid);
 });

 A.collect=async uid=>withProfile(uid,async p=>{
  const b=idleBank(p,now());
  await commit(p,{gold:p.gold+b.gold,tickets:p.tickets+b.tickets,last_collect:new Date(now()).toISOString()});
  return full(uid,{collected:b});
 });

 A.fight=async(uid,{floor})=>withProfile(uid,async p=>{
  floor=Math.floor(Number(floor));
  if(!(floor>=1&&floor<=p.max_floor+1))fail('floor','Étage non débloqué.');
  const wait=Date.parse(p.next_fight_at)-now();if(wait>300&&!p.is_admin)fail('cooldown','Combat précédent encore en cours.',{wait});
  const cards=await getCards(uid),team=unitsOf(p.team,cards);if(!team.length)fail('team','Ton équipe est vide.');
  const enemies=genEnemies(floor),seed=Math.floor(Math.random()*2147483647);
  const b=new Battle(team,enemies,seed);while(!b.over)b.step();
  const win=b.winner===0,gb=goldBonus(p.team);let gold=0,tickets=0,first=false;
  if(win){if(floor>p.max_floor){first=true;gold=Math.round((30+12*floor)*gb);tickets=1+(floor%5===0?5:0);}else{gold=Math.round((30+12*floor)*0.5*gb);if(Math.random()<0.15)tickets=1;}}
  const cooldownMs=Math.round(b.t*40/4*0.9);
  await commit(p,{gold:p.gold+gold,tickets:p.tickets+tickets,max_floor:first?floor:p.max_floor,next_fight_at:new Date(now()+cooldownMs).toISOString()});
  return full(uid,{battle:{seed,floor,team,enemies,win,gold,tickets,first,ticks:b.t}});
 });

 A.pvp=async(uid,{target})=>{
  if(!target||target===uid)fail('target','Adversaire invalide.');
  const t=await getProfile(target);if(!t)fail('target','Adversaire introuvable.');
  if(t.is_admin)fail('target','Le compte admin ne participe pas à l\'arène.');
  return withProfile(uid,async p=>{
   if(p.is_admin)fail('admin','Le compte admin ne participe pas à l\'arène, pour ne pas fausser les cotes.');
   const day=parisDay(now()),used=p.pvp_day===day?p.pvp_used:0;
   if(used>=PVP_PER_DAY)fail('pvp','Plus de combats PvP aujourd\'hui. Reviens demain.');
   const [mine,theirs]=await Promise.all([getCards(uid),getCards(target)]);
   const att=unitsOf(p.team,mine);if(!att.length)fail('team','Ton équipe est vide.');
   let def=unitsOf(t.defense,theirs);if(!def.length)def=unitsOf(t.team,theirs);if(!def.length)fail('target','Cet adversaire n\'a pas de défense.');
   const seed=Math.floor(Math.random()*2147483647),b=new Battle(att,def,seed);while(!b.over)b.step();
   const win=b.winner===0,exp=1/(1+Math.pow(10,(t.pvp_rating-p.pvp_rating)/400)),delta=Math.round(32*((win?1:0)-exp));
   const gold=win?150:30;
   await commit(p,{pvp_rating:p.pvp_rating+delta,pvp_wins:p.pvp_wins+(win?1:0),pvp_losses:p.pvp_losses+(win?0:1),pvp_day:day,pvp_used:used+1,gold:p.gold+gold});
   for(let i=0;i<5;i++){const d=await getProfile(target);try{await commit(d,{pvp_rating:d.pvp_rating-delta});break;}catch(e){if(e.code!=='conflict')throw e;}}
   await db.from('pvp_log').insert({attacker:uid,defender:target,win,delta,seed});
   return full(uid,{battle:{seed,team:att,enemies:def,win,delta,gold,targetPseudo:t.pseudo}});
  });
 };
 /* Outils réservés au compte admin, qui n'agissent que sur lui-même */
 const admin=f=>async(uid,body)=>withProfile(uid,async p=>{if(!p.is_admin)fail('admin','Réservé au compte admin.');return f(uid,p,body||{});});
 A.admin_grant=admin(async(uid,p,{gold,tickets})=>{gold=Math.max(0,Math.min(1e7,Math.floor(+gold||0)));tickets=Math.max(0,Math.min(1000,Math.floor(+tickets||0)));await commit(p,{gold:p.gold+gold,tickets:p.tickets+tickets});return full(uid);});
 A.admin_floor=admin(async(uid,p,{floor})=>{floor=Math.max(0,Math.min(500,Math.floor(+floor||0)));await commit(p,{max_floor:floor});return full(uid);});
 A.admin_card=admin(async(uid,p,{card,lvl,stars})=>{if(!CARD[card])fail('card','Héros inconnu.');const cards=await getCards(uid);cards[card]={lvl:Math.max(1,Math.min(300,Math.floor(+lvl||1))),stars:Math.max(0,Math.min(5,Math.floor(+stars||0)))};const cs=collectionStats(cards);await commit(p,{collection_score:cs.score,collection_count:cs.count});await upsertCards(uid,[{id:card,...cards[card]}]);return full(uid);});
 A.admin_all=admin(async(uid,p,{lvl})=>{lvl=Math.max(1,Math.min(300,Math.floor(+lvl||1)));const cards={};CARDS.forEach(c=>cards[c.id]={lvl,stars:0});const cs=collectionStats(cards);await commit(p,{collection_score:cs.score,collection_count:cs.count});await upsertCards(uid,CARDS.map(c=>({id:c.id,lvl,stars:0})));return full(uid);});
 A.admin_reset=admin(async(uid,p)=>{const {error}=await db.from('cards').delete().eq('user_id',uid).neq('card_id',p.legend);if(error)throw error;await db.from('cards').update({lvl:1,stars:0}).eq('user_id',uid).eq('card_id',p.legend);const cs=collectionStats({[p.legend]:{lvl:1,stars:0}});await commit(p,{gold:START_GOLD,tickets:START_TICKETS,max_floor:0,pity:0,pulls:0,team:[p.legend],defense:[p.legend],collection_score:cs.score,collection_count:cs.count,last_collect:new Date(now()).toISOString()});return full(uid);});
 return A;
}


const db = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
const GAME = makeGame(db);
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data, error } = await db.auth.getUser(token);
    if (error || !data || !data.user) return reply({ error: "auth", message: "Connexion requise." }, 401);
    const body = await req.json().catch(() => ({}));
    const fn = GAME[body.action];
    if (!fn) return reply({ error: "bad", message: "Action inconnue." }, 400);
    return reply(await fn(data.user.id, body));
  } catch (e) {
    if (e && e.code && e instanceof GameError) return reply({ error: e.code, message: e.message, ...(e.extra || {}) }, 400);
    console.error(e);
    return reply({ error: "server", message: "Erreur du serveur, réessaie." }, 500);
  }
});
