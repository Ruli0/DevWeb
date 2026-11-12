// Quel bruitage pour quelle action. Les sons sont synthétisés par scripts/build-sons.js.
//   decalage : secondes après le début de l'action
//   parFois / pas : répété « fois » fois, toutes les « pas » secondes (le coassement)
//   volume : de 0 à 1
const SONS_PAR_ACTION = {
  'cadre.alerte': [{ fichier: 'vitre.wav', volume: 0.7 }],
  'plantes.tailler': [{ fichier: 'cisaille.wav', volume: 0.7 }],
  'cadre.lueur': [{ fichier: 'carillon.wav', volume: 0.35 }],
  'cadre.apaiser': [{ fichier: 'carillon.wav', volume: 0.45 }],
  'mouche.venir': [{ fichier: 'bzz.wav', volume: 0.35 }],
  'cameleon.langue': [{ fichier: 'fwip.wav', volume: 0.9 }],
  'cameleon.avaler': [{ fichier: 'gloup.wav', volume: 0.8 }],
  'cameleon.teinte': [{ fichier: 'carillon.wav', volume: 0.5 }],
  'scarabee.avancer': [{ fichier: 'trotte.wav', decalage: 0.4, volume: 0.5 }, { fichier: 'trotte.wav', decalage: 1.9, volume: 0.5 }],
  'dionee.fermer': [{ fichier: 'clac.wav', decalage: 0.08, volume: 1 }],
  'grenouille.coasser': [{ fichier: 'croa.wav', parFois: true, pas: 0.85, volume: 0.75 }],
  'goutte.apparaitre': [{ fichier: 'plic.wav', volume: 0.8 }],
  'filtre.signaler': [{ fichier: 'bloup.wav', volume: 0.75 }],
  'goutte.bassin': [{ fichier: 'plic.wav', volume: 0.9 }],
  'fourmiliere.agiter': [{ fichier: 'trotte.wav', volume: 0.45 }],
  'eclaireuses.partir': [{ fichier: 'trotte.wav', volume: 0.55 }, { fichier: 'trotte.wav', decalage: 1.6, volume: 0.45 }],
  'eclaireuses.revenir': [{ fichier: 'trotte.wav', volume: 0.55 }, { fichier: 'trotte.wav', decalage: 1.6, volume: 0.45 }],
  'butin.montrer': [{ fichier: 'pop.wav', volume: 0.6 }],
};

const SON_CARTE = { fichier: 'pop.wav', volume: 0.8 };
const SON_CAMERA = { fichier: 'souffle.wav', volume: 0.35 };
const SON_AMBIANCE = { fichier: 'ambiance.wav', volume: 0.35 };

module.exports = { SONS_PAR_ACTION, SON_CARTE, SON_CAMERA, SON_AMBIANCE };
