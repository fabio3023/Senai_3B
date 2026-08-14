export default function manifest() {
  return {
    name: "SESI Times",
    short_name: "SESI Times",
    description: "Esporte, educação e espírito de equipe no SESI Mirandópolis.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#071c3d",
    lang: "pt-BR",
    icons: [
      {
        src: "/sesi-times-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
