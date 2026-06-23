import Link from "next/link";

const colonnes = [
  {
    titre: "Matières populaires",
    liens: [
      { label: "Cours de Mathématiques", href: "#" },
      { label: "Cours de Physique-Chimie", href: "#" },
      { label: "Cours d'Anglais", href: "#" },
      { label: "Cours de Français", href: "#" },
      { label: "Cours d'Informatique", href: "#" },
      { label: "Cours de SVT", href: "#" },
    ],
  },
  {
    titre: "Villes",
    liens: [
      { label: "Répétiteurs à Abidjan", href: "#" },
      { label: "Répétiteurs à Bouaké", href: "#" },
      { label: "Répétiteurs à Yamoussoukro", href: "#" },
      { label: "Répétiteurs à San-Pédro", href: "#" },
      { label: "Répétiteurs à Daloa", href: "#" },
      { label: "Cours en ligne", href: "#" },
    ],
  },
  {
    titre: "EduMatch CI",
    liens: [
      { label: "Comment ça marche", href: "/comment-ca-marche" },
      { label: "Devenir répétiteur", href: "/inscription" },
      { label: "Tarifs", href: "#" },
      { label: "Blog pédagogique", href: "#" },
      { label: "Témoignages", href: "#" },
      { label: "Nous contacter", href: "#" },
    ],
  },
  {
    titre: "Aide & Légal",
    liens: [
      { label: "Centre d'aide", href: "#" },
      { label: "Conditions d'utilisation", href: "/cgu" },
      { label: "Politique de confidentialité", href: "/politique-confidentialite" },
      { label: "Mentions légales", href: "#" },
      { label: "Signaler un problème", href: "#" },
    ],
  },
];

const reseaux = [
  { label: "Facebook", icon: "f", href: "#" },
  { label: "Instagram", icon: "in", href: "#" },
  { label: "WhatsApp", icon: "w", href: "#" },
  { label: "LinkedIn", icon: "li", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-300 font-sans">

      {/* Bannière CTA */}
      

      {/* Corps du footer */}
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Colonnes de liens */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {colonnes.map((col) => (
            <div key={col.titre}>
              <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">
                {col.titre}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.liens.map((lien) => (
                  <li key={lien.label}>
                    <Link
                      href={lien.href}
                      className="text-sm text-zinc-400 hover:text-orange-400 transition-colors"
                    >
                      {lien.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Séparateur */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo + baseline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xl font-extrabold text-orange-500">Edu</span>
              <span className="text-xl font-extrabold text-white">Match</span>
              <span className="ml-1 text-xs font-semibold text-white bg-green-600 rounded px-1.5 py-0.5">CI</span>
            </div>
            <p className="text-xs text-zinc-500 max-w-xs text-center md:text-left">
              La plateforme N°1 de mise en relation entre élèves et répétiteurs en Côte d&apos;Ivoire.
            </p>
          </div>

          {/* Réseaux sociaux */}
          <div className="flex items-center gap-3">
            {reseaux.map((r) => (
              <Link
                key={r.label}
                href={r.href}
                aria-label={r.label}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-700 hover:border-orange-500 hover:text-orange-400 text-zinc-400 transition-colors text-xs font-bold uppercase"
              >
                {r.icon}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-zinc-500 text-center md:text-right">
            © {new Date().getFullYear()} EduMatch CI<br />
            Tous droits réservés
          </p>
        </div>

      </div>
    </footer>
  );
}
