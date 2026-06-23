import Link from "next/link";

export const metadata = {
  title: "Politique de Confidentialité — EduMatch CI",
  description: "Politique de confidentialité et protection des données personnelles d'EduMatch CI",
};

const sections = [
  {
    id: "responsable",
    titre: "1. Responsable du traitement",
    contenu: `EduMatch CI, société de droit ivoirien, est responsable du traitement de vos données personnelles. Pour toute question relative à la protection de vos données, vous pouvez nous contacter à : privacy@edumatch-ci.com`,
  },
  {
    id: "collecte",
    titre: "2. Données collectées",
    contenu: `Nous collectons les données suivantes selon votre utilisation de la plateforme :

**Données d'inscription :**
• Nom, prénom, adresse e-mail, numéro de téléphone
• Rôle (élève ou répétiteur), ville de résidence
• Mot de passe (stocké sous forme chiffrée, jamais en clair)

**Données de profil (répétiteurs) :**
• Photo de profil, biographie, matières enseignées
• Tarif horaire, disponibilités
• Pièce d'identité (pour la vérification KYC — stockée de manière sécurisée)

**Données de transactions :**
• Historique des cours réservés et effectués
• Informations de paiement (nous ne stockons pas les numéros de carte — traitement via prestataire certifié)
• Montants, dates, statuts des transactions

**Données d'utilisation :**
• Adresse IP, type de navigateur, pages visitées
• Cookies de session et de préférences (voir section 7)

**Données de communication :**
• Messages échangés via la messagerie interne de la plateforme
• Avis et notes publiés`,
  },
  {
    id: "utilisation",
    titre: "3. Finalités du traitement",
    contenu: `Vos données sont utilisées pour :

• **Fourniture du service** : création et gestion de votre compte, mise en relation entre élèves et répétiteurs, traitement des réservations et paiements.
• **Sécurité** : vérification d'identité (KYC), prévention des fraudes, authentification.
• **Communication** : envoi d'e-mails transactionnels (confirmation de cours, reçus de paiement, notifications importantes).
• **Amélioration du service** : analyse des usages pour améliorer l'expérience utilisateur.
• **Obligations légales** : conservation des données financières conformément aux obligations fiscales et comptables ivoiriennes.`,
  },
  {
    id: "base",
    titre: "4. Base juridique",
    contenu: `Le traitement de vos données repose sur :
• L'exécution du contrat (CGU) que vous avez accepté lors de votre inscription.
• Notre intérêt légitime à sécuriser et améliorer notre plateforme.
• Votre consentement, pour les communications marketing (vous pouvez le retirer à tout moment).
• Nos obligations légales, pour la conservation des données financières.`,
  },
  {
    id: "conservation",
    titre: "5. Durée de conservation",
    contenu: `• **Données de compte actif** : conservées pendant toute la durée d'utilisation du service.
• **Données après suppression du compte** : supprimées sous 30 jours, sauf obligation légale contraire.
• **Données financières** : conservées 10 ans conformément aux obligations fiscales ivoiriennes.
• **Données de logs techniques** : conservées 12 mois.
• **Pièces d'identité KYC** : supprimées 6 mois après vérification ou clôture du compte.`,
  },
  {
    id: "partage",
    titre: "6. Partage des données",
    contenu: `Nous ne vendons jamais vos données personnelles à des tiers.

Nous pouvons partager vos données avec :
• **Prestataires de paiement** (Orange Money, MTN Mobile Money, processeurs bancaires) : uniquement les informations nécessaires à la transaction.
• **Hébergeurs** : nos serveurs sont hébergés dans des datacenters sécurisés.
• **Autorités compétentes** : sur requête légale, conformément au droit ivoirien.

Les données partagées entre élèves et répétiteurs (nom, prénom, note, avis) sont visibles sur la plateforme conformément à son fonctionnement.`,
  },
  {
    id: "cookies",
    titre: "7. Cookies",
    contenu: `Nous utilisons les types de cookies suivants :

• **Cookies essentiels** : nécessaires au fonctionnement du service (session, authentification). Ils ne peuvent pas être désactivés.
• **Cookies de préférences** : mémorisent vos choix (langue, filtres de recherche). Vous pouvez les refuser.
• **Cookies analytiques** : nous aident à comprendre comment la plateforme est utilisée (pages visitées, durée de session). Désactivables depuis vos paramètres de navigateur.

Nous n'utilisons pas de cookies publicitaires ou de tracking tiers.`,
  },
  {
    id: "droits",
    titre: "8. Vos droits",
    contenu: `Conformément aux principes de protection des données applicables, vous disposez des droits suivants :

• **Droit d'accès** : obtenir une copie de vos données personnelles.
• **Droit de rectification** : corriger des informations inexactes.
• **Droit à l'effacement** : demander la suppression de vos données (sous réserve des obligations légales).
• **Droit à la portabilité** : recevoir vos données dans un format lisible par machine.
• **Droit d'opposition** : vous opposer à certains traitements (notamment le marketing).
• **Droit à la limitation** : restreindre le traitement dans certains cas.

Pour exercer ces droits, contactez-nous à : privacy@edumatch-ci.com
Nous répondrons dans un délai maximum de 30 jours.`,
  },
  {
    id: "securite",
    titre: "9. Sécurité des données",
    contenu: `Nous mettons en œuvre les mesures techniques et organisationnelles suivantes :

• Chiffrement des communications (HTTPS/TLS)
• Mots de passe hachés avec algorithme bcrypt
• Accès aux données limité aux personnels habilités
• Journalisation des accès sensibles
• Sauvegarde régulière des données
• Tests de sécurité réguliers

En cas de violation de données susceptible de présenter un risque pour vos droits, nous nous engageons à vous en informer dans les 72 heures suivant sa découverte.`,
  },
  {
    id: "contact",
    titre: "10. Contact et réclamations",
    contenu: `Pour toute question ou réclamation relative à la protection de vos données personnelles :

• E-mail : privacy@edumatch-ci.com
• Adresse : EduMatch CI, Abidjan, Côte d'Ivoire

Nous nous engageons à traiter votre demande avec sérieux et dans les meilleurs délais.

La présente politique peut être mise à jour. Toute modification significative vous sera notifiée par e-mail ou via la plateforme. La date de dernière mise à jour figure en haut de ce document.`,
  },
];

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-extrabold text-orange-500">Edu</span>
            <span className="text-xl font-extrabold text-zinc-800">Match</span>
            <span className="ml-1 text-xs font-semibold text-white bg-green-600 rounded px-1.5 py-0.5">CI</span>
          </Link>
          <Link href="/" className="text-sm text-zinc-500 hover:text-orange-500 transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-zinc-800 mb-3">
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-zinc-400">
            Dernière mise à jour : mai 2026 — Protection de vos données personnelles
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table des matières */}
          <aside className="lg:w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sticky top-24">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Sommaire</p>
              <nav className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-xs text-zinc-600 hover:text-orange-500 transition-colors py-1 border-l-2 border-transparent hover:border-orange-400 pl-2"
                  >
                    {s.titre}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Contenu */}
          <div className="flex-1 flex flex-col gap-6">
            {sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6"
              >
                <h2 className="text-base font-bold text-zinc-800 mb-4">{s.titre}</h2>
                <div className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                  {s.contenu}
                </div>
              </section>
            ))}

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-sm text-blue-800">
              <p className="font-bold mb-1">Vos données vous appartiennent</p>
              <p>
                Vous pouvez à tout moment accéder à vos données, les corriger ou demander leur suppression
                depuis votre tableau de bord sous <strong>Paramètres → Mon compte</strong>, ou en nous écrivant à{" "}
                <a href="mailto:privacy@edumatch-ci.com" className="underline hover:text-blue-600">
                  privacy@edumatch-ci.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-100 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© 2026 EduMatch CI — Tous droits réservés</p>
          <div className="flex gap-4">
            <Link href="/cgu" className="hover:text-orange-500 transition-colors">CGU</Link>
            <Link href="/politique-confidentialite" className="text-orange-500 font-semibold">Politique de confidentialité</Link>
            <Link href="/comment-ca-marche" className="hover:text-orange-500 transition-colors">Comment ça marche</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
