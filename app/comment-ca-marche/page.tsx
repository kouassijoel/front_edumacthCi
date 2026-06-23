import Link from "next/link";
import { Search, MessageCircle, BookOpen, Star, ShieldCheck, CreditCard, GraduationCap } from "lucide-react";

const ETAPES_ELEVE = [
  {
    num: "01",
    Icon: Search,
    titre: "Trouvez votre répétiteur",
    desc: "Recherchez parmi nos répétiteurs vérifiés selon la matière, la ville, le tarif et les avis d'autres élèves.",
  },
  {
    num: "02",
    Icon: MessageCircle,
    titre: "Contactez & planifiez",
    desc: "Envoyez une demande de cours ou un message directement au répétiteur. Convenez d'un créneau qui vous convient.",
  },
  {
    num: "03",
    Icon: BookOpen,
    titre: "Suivez votre cours",
    desc: "Le cours se déroule à domicile, en ligne ou en salle selon votre accord. Confirmez le début et la fin du cours.",
  },
  {
    num: "04",
    Icon: Star,
    titre: "Évaluez et progressez",
    desc: "Après chaque cours terminé, laissez un avis pour aider la communauté et motivez votre répétiteur.",
  },
];

const ETAPES_REPETITEUR = [
  {
    num: "01",
    Icon: GraduationCap,
    titre: "Créez votre profil",
    desc: "Inscrivez-vous gratuitement, renseignez vos matières, vos tarifs, votre ville et téléchargez vos diplômes.",
  },
  {
    num: "02",
    Icon: ShieldCheck,
    titre: "Faites vérifier votre compte",
    desc: "Soumettez vos documents pour obtenir le badge de vérification KYC. Cela renforce votre crédibilité.",
  },
  {
    num: "03",
    Icon: MessageCircle,
    titre: "Recevez des demandes",
    desc: "Les élèves intéressés vous contactent. Acceptez les demandes, planifiez vos cours et gérez votre agenda.",
  },
  {
    num: "04",
    Icon: CreditCard,
    titre: "Recevez vos paiements",
    desc: "Vos revenus s'accumulent après chaque cours validé. Faites une demande de versement à tout moment.",
  },
];

const AVANTAGES = [
  { icon: "🛡️", titre: "Profils vérifiés", desc: "Nos répétiteurs passent par un processus de vérification KYC pour garantir leur sérieux." },
  { icon: "💸", titre: "Paiements sécurisés", desc: "Paiements via Orange Money, Wave, MTN MoMo — sans frais cachés." },
  { icon: "⭐", titre: "Système d'avis", desc: "Des milliers d'avis authentiques d'élèves pour vous aider à choisir le meilleur répétiteur." },
  { icon: "📱", titre: "Simple et rapide", desc: "Trouvez un répétiteur, planifiez un cours et payez en moins de 5 minutes." },
  { icon: "🇨🇮", titre: "100 % Côte d'Ivoire", desc: "Une plateforme conçue pour les réalités locales — villes, matières, programmes scolaires CI." },
  { icon: "🚀", titre: "Boost de visibilité", desc: "Les répétiteurs peuvent booster leur profil pour apparaître en tête de liste." },
];

const FAQ = [
  {
    q: "L'inscription est-elle payante ?",
    r: "Non. L'inscription est entièrement gratuite pour les élèves comme pour les répétiteurs.",
  },
  {
    q: "Comment se font les paiements ?",
    r: "Les paiements se font via Mobile Money (Orange Money, Wave, MTN MoMo) ou carte bancaire directement sur la plateforme.",
  },
  {
    q: "Que se passe-t-il si un cours est annulé ?",
    r: "En cas d'annulation, vous pouvez reprogrammer gratuitement. Les litiges sont gérés par notre équipe support.",
  },
  {
    q: "Puis-je choisir un cours en ligne ou à domicile ?",
    r: "Oui. Chaque répétiteur indique ses modalités : domicile, webcam, en salle ou mixte. Vous choisissez selon vos préférences.",
  },
  {
    q: "Comment être sûr de la qualité d'un répétiteur ?",
    r: "Consultez ses avis d'élèves, sa note moyenne et son badge de vérification KYC. Les profils vérifiés sont signalés par un ✓.",
  },
];

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 to-white pt-16 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold text-orange-500 bg-orange-100 px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            Guide d&apos;utilisation
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 leading-tight mb-5">
            Comment fonctionne<br />
            <span className="text-orange-500">EduMatch CI</span> ?
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed">
            La plateforme qui connecte les élèves ivoiriens aux meilleurs répétiteurs près de chez eux.
            Simple, sécurisé, local.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link href="/"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors">
              Trouver un répétiteur →
            </Link>
            <Link href="/inscription"
              className="px-6 py-3 border-2 border-orange-400 text-orange-500 hover:bg-orange-50 font-bold rounded-xl text-sm transition-colors">
              Devenir répétiteur
            </Link>
          </div>
        </div>
      </section>

      {/* Pour les élèves */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Pour les élèves</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-800 mt-3">
              Trouvez le bon répétiteur en 4 étapes
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ETAPES_ELEVE.map((e) => (
              <div key={e.num} className="flex flex-col gap-4 p-6 rounded-2xl border border-zinc-100 bg-zinc-50 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-orange-100">{e.num}</span>
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
                    <e.Icon size={20} />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-zinc-800 mb-1">{e.titre}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour les répétiteurs */}
      <section className="py-16 px-4 bg-zinc-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">Pour les répétiteurs</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-800 mt-3">
              Monétisez votre savoir en 4 étapes
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ETAPES_REPETITEUR.map((e) => (
              <div key={e.num} className="flex flex-col gap-4 p-6 rounded-2xl border border-zinc-100 bg-white hover:border-green-200 hover:bg-green-50/20 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-green-100">{e.num}</span>
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                    <e.Icon size={20} />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-zinc-800 mb-1">{e.titre}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-800">
              Pourquoi choisir EduMatch ?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVANTAGES.map((a) => (
              <div key={a.titre} className="flex gap-4 p-6 rounded-2xl border border-zinc-100 bg-zinc-50">
                <span className="text-2xl shrink-0">{a.icon}</span>
                <div>
                  <p className="font-bold text-zinc-800 mb-1">{a.titre}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-zinc-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-800">Questions fréquentes</h2>
          </div>
          <div className="flex flex-col gap-4">
            {FAQ.map((f) => (
              <div key={f.q} className="bg-white rounded-2xl border border-zinc-100 p-6">
                <p className="font-bold text-zinc-800 mb-2">{f.q}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 bg-orange-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Des centaines de répétiteurs qualifiés vous attendent sur EduMatch CI.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/"
              className="px-8 py-3.5 bg-white text-orange-500 font-extrabold rounded-xl text-sm hover:bg-orange-50 transition-colors">
              Trouver un répétiteur
            </Link>
            <Link href="/inscription"
              className="px-8 py-3.5 border-2 border-white text-white font-extrabold rounded-xl text-sm hover:bg-orange-600 transition-colors">
              Devenir répétiteur
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
