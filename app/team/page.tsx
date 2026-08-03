import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PlasticCard } from "@/components/plastic-card";
import {
  buildWebPageJsonLd,
  createPageMetadata,
  routeMetadata,
} from "@/lib/seo";

export const metadata = createPageMetadata(routeMetadata.team);

const teamMembers = [
  {
    name: "Keenan Gray",
    role: "Founder & Director",
    image: "/images/team/keenan-gray.jpg",
    imagePosition: "58% 38%",
    instagram: "thiskeenan",
    bio: (
      <>
        Keenan Gray is a mountain-born, Brooklyn-based film director whose work
        combines the physicality of his twelve years as a circus performer with
        the sharp comedic instincts he developed at <em>Saturday Night Live</em>.
        He explores outlandish concepts with emotional authenticity, directing
        loosely enough for performances to feel natural and unscripted, then
        editing like it&apos;s surgery.
      </>
    ),
  },
  {
    name: "Sam Ferlo",
    role: "Theater Producer & Performer",
    image: "/images/team/sam-ferlo.jpg",
    imagePosition: "58% 42%",
    instagram: "samuelferlo",
    bio: "",
  },
  {
    name: "Elena Vuvunikyan",
    role: "Event Producer",
    image: "/images/team/elena-vuvunikyan.jpg",
    imagePosition: "72% 82%",
    instagram: "elenavuv",
    bio: "",
  },
] as const;

export default function TeamPage() {
  return (
    <main className="hero-pad team-page">
      <JsonLd data={buildWebPageJsonLd(routeMetadata.team)} />
      <section className="container-page">
        <p className="copy-wide small-label mb-8 text-red-300">
          Filmshow · Team
        </p>
        <h1 className="section-kicker max-w-5xl text-stone-100">
          The people in the room.
        </h1>
        <p className="body-large mt-10 max-w-3xl text-stone-300">
          Filmshow is built by filmmakers, producers, and performers who care
          about what happens when an audience shows up.
        </p>
      </section>

      <section
        className="container-page mt-16 grid gap-5 pb-24 sm:mt-20 md:grid-cols-2 lg:grid-cols-3"
        aria-label="Filmshow team members"
      >
        {teamMembers.map((member) => (
          <PlasticCard key={member.name} className="team-card" reveal>
            <div className="team-card-image-wrap" data-reveal="photo">
              <Image
                src={member.image}
                alt={`${member.name} headshot`}
                fill
                sizes="(min-width: 1024px) 15vw, (min-width: 768px) 24vw, 50vw"
                className="team-card-image"
                style={{ objectPosition: member.imagePosition }}
              />
            </div>
            <div className="team-card-copy">
              <h2 className="team-card-name text-stone-100">{member.name}</h2>
              <p className="copy-wide small-label mt-3 text-red-300">
                {member.role}
              </p>
              <Link
                href={`https://www.instagram.com/${member.instagram}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="team-card-instagram"
              >
                @{member.instagram}
              </Link>
              <p
                className="team-card-bio body-copy mt-8 text-stone-400"
                data-bio-field={`${member.name} bio`}
                aria-label={`${member.name} bio`}
              >
                {member.bio}
              </p>
            </div>
          </PlasticCard>
        ))}
      </section>
    </main>
  );
}
