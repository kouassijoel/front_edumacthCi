import Link from "next/link";

export const metadata = {
  title: "Conditions Générales d'Utilisation — EduMatch CI",
  description: "Conditions générales d'utilisation de la plateforme EduMatch CI",
};

const sections = [
  {
    id: "objet",
    titre: "1. Objet",
    contenu: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme EduMatch CI, accessible à l'adresse edumatch-ci.com, éditée par EduMatch CI, société de droit ivoirien. En créant un compte ou en utilisant les services proposés, l'utilisateur accepte sans réserve les présentes CGU.`,
  },
  {
    id: "definitions",
    titre: "2. Définitions",
    contenu: `• **Plateforme** : le site web et les applications mobiles EduMatch CI.
• **Élève** : toute personne physique s'inscrivant pour trouver un répétiteur.
• **Répétiteur** : toute personne physique proposant des cours particuliers via la plateforme.
• **Utilisateur** : tout élève ou répétiteur inscrit.
• **Cours** : prestation de soutien scolaire convenue entre un élève et un répétiteur via la plateforme.
• **Session** : séance de cours d'une durée définie, confirmée par les deux parties.`,
  },
  {
    id: "inscription",
    titre: "3. Inscription et compte",
    contenu: `3.1 L'inscription est ouverte à toute personne physique majeure ou mineure représentée par un tuteur légal résidant en Côte d'Ivoire.

3.2 L'utilisateur s'engage à fournir des informations exactes, complètes et à les maintenir à jour. Toute fausse déclaration peut entraîner la suspension immédiate du compte.

3.3 Chaque utilisateur est responsable de la confidentialité de ses identifiants de connexion. EduMatch CI ne saurait être tenu responsable des accès non autorisés résultant d'une négligence de l'utilisateur.

3.4 Les répétiteurs doivent compléter une vérification d'identité (KYC) pour accéder à l'ensemble des fonctionnalités de la plateforme et recevoir des paiements.`,
  },
  {
    id: "services",
    titre: "4. Services proposés",
    contenu: `4.1 EduMatch CI met en relation des élèves et des répétiteurs. La plateforme ne fournit pas elle-même de cours particuliers.

4.2 Les répétiteurs créent leur profil, qui constitue leur annonce visible par les élèves. Ils fixent librement leur tarif horaire, leurs matières et leur disponibilité.

4.3 Les élèves peuvent rechercher des répétiteurs selon la matière, la ville, le prix et la note, puis réserver un cours directement via la plateforme.

4.4 EduMatch CI propose un système de messagerie intégré permettant aux parties de communiquer avant et après la réservation.`,
  },
  {
    id: "paiements",
    titre: "5. Paiements et commissions",
    contenu: `5.1 Les paiements s'effectuent via les moyens de paiement disponibles sur la plateforme (Orange Money, MTN Mobile Money, carte bancaire).

5.2 EduMatch CI prélève une commission sur chaque transaction, dont le taux est affiché au moment de la réservation.

5.3 En cas d'annulation par l'élève moins de 24 heures avant le cours, des frais d'annulation peuvent s'appliquer conformément à la politique d'annulation en vigueur.

5.4 Les fonds sont reversés au répétiteur après validation du cours terminé, dans un délai de 3 à 5 jours ouvrés.

5.5 Les répétiteurs peuvent demander un retrait de leurs gains vers leur compte mobile money ou bancaire depuis leur tableau de bord.`,
  },
  {
    id: "obligations",
    titre: "6. Obligations des utilisateurs",
    contenu: `Les utilisateurs s'engagent à :
• Respecter les lois et règlements en vigueur en Côte d'Ivoire.
• Ne pas utiliser la plateforme à des fins frauduleuses, illicites ou contraires aux bonnes mœurs.
• Traiter les autres utilisateurs avec respect et courtoisie.
• Ne pas contourner le système de paiement de la plateforme en concluant des arrangements directs avec les contreparties rencontrées via EduMatch CI.
• Ne pas publier de contenu faux, trompeur ou portant atteinte aux droits de tiers.
• Signaler tout comportement suspect ou abusif au service de modération.`,
  },
  {
    id: "responsabilite",
    titre: "7. Responsabilités",
    contenu: `7.1 EduMatch CI joue un rôle d'intermédiaire technique. Elle ne peut être tenue responsable de la qualité des cours dispensés, du comportement des répétiteurs ou des élèves, ni des préjudices découlant d'une relation directe entre les parties.

7.2 EduMatch CI met tout en œuvre pour garantir la disponibilité de la plateforme mais ne saurait être tenu responsable des interruptions techniques indépendantes de sa volonté.

7.3 Les avis publiés sur la plateforme reflètent l'opinion de leurs auteurs. EduMatch CI se réserve le droit de modérer ou supprimer tout avis contraire aux présentes CGU.`,
  },
  {
    id: "propriete",
    titre: "8. Propriété intellectuelle",
    contenu: `8.1 L'ensemble des contenus de la plateforme (logo, textes, graphismes, interface) sont la propriété exclusive d'EduMatch CI et protégés par les lois ivoiriennes sur la propriété intellectuelle.

8.2 Toute reproduction, modification ou exploitation non autorisée est formellement interdite.

8.3 En publiant du contenu sur la plateforme (photo de profil, biographie, avis), l'utilisateur accorde à EduMatch CI une licence non exclusive d'utilisation à des fins de fonctionnement et de promotion du service.`,
  },
  {
    id: "resiliation",
    titre: "9. Résiliation",
    contenu: `9.1 Tout utilisateur peut supprimer son compte à tout moment depuis les paramètres de son tableau de bord.

9.2 EduMatch CI se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, sans préavis ni indemnité.

9.3 La suppression d'un compte entraîne la perte des données associées, sous réserve des obligations légales de conservation.`,
  },
  {
    id: "droit",
    titre: "10. Droit applicable et litiges",
    contenu: `10.1 Les présentes CGU sont régies par le droit ivoirien.

10.2 En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire.

10.3 À défaut d'accord amiable, tout litige sera soumis à la compétence exclusive des tribunaux d'Abidjan, Côte d'Ivoire.

10.4 EduMatch CI se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par e-mail ou notification sur la plateforme. La poursuite de l'utilisation après modification vaut acceptation des nouvelles conditions.`,
  },
];

export default function CGUPage() {
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
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-sm text-zinc-400">
            Dernière mise à jour : mai 2026 — Applicables sur tout le territoire de Côte d&apos;Ivoire
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

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-sm text-orange-800">
              <p className="font-bold mb-1">Contact</p>
              <p>
                Pour toute question relative aux présentes CGU, vous pouvez nous contacter à{" "}
                <a href="mailto:contact@edumatch-ci.com" className="underline hover:text-orange-600">
                  contact@edumatch-ci.com
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
            <Link href="/cgu" className="text-orange-500 font-semibold">CGU</Link>
            <Link href="/politique-confidentialite" className="hover:text-orange-500 transition-colors">Politique de confidentialité</Link>
            <Link href="/comment-ca-marche" className="hover:text-orange-500 transition-colors">Comment ça marche</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
