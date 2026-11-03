/** Dados de contacto e informação geral — substitua pelos valores reais. */
export const SITE = {
  name: "Reis Prime Motors",
  tagline: "Carros que merecem a estrada",
  url: "https://reisprimemotors.pt",
  phone: "+351 912 345 678",
  phoneHref: "tel:+351912345678",
  /** Número de WhatsApp em formato internacional, só dígitos */
  whatsapp: "351912345678",
  email: "geral@reisprimemotors.pt",
  address: ["Avenida da Liberdade, 100", "4000-000 Porto"],
  mapsUrl: "https://maps.google.com/?q=Reis+Prime+Motors",
  hours: [
    { days: "Segunda a Sexta", time: "09h30 – 19h30" },
    { days: "Sábado", time: "10h00 – 18h00" },
    { days: "Domingo", time: "Por marcação" },
  ],
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
    youtube: "https://youtube.com/",
  },
} as const;

export const NAV = [
  { href: "/#stand", label: "Stand" },
  { href: "/#vender", label: "Vender o meu carro" },
  { href: "/#financiamento", label: "Financiamento" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#contactos", label: "Contactos" },
] as const;

export const whatsappLink = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
