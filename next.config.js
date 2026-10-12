/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dossier de sortie du build.
  //
  // `next dev` et `next build` écrivent tous les deux dans .next. Lancer
  // un build de production pendant que le serveur de dev tourne réécrit
  // ses fichiers sous ses pieds : il cherche ensuite des morceaux qui
  // n'existent plus (« Cannot find module ./8948.js ») et la page casse.
  //
  // NEXT_DIST_DIR permet de vérifier un build dans un dossier à part,
  // sans toucher au serveur en cours :
  //   $env:NEXT_DIST_DIR = ".next-verif"; npx next build
  //
  // Vercel ne définit pas cette variable : la production utilise .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
}

module.exports = nextConfig
