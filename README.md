# odonexo.com

Diş laboratuvar malzemeleri e-ticaret sitesi.

## Teknolojiler

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (ikonlar)

## Modüler Yapı

```
components/
├── layout/          # Header, Footer
└── modules/         # Hero, ProductCard, CategoryGrid, vb.

lib/
├── data/            # Ürün ve kategori verileri
└── cart-context.tsx # Sepet yönetimi

app/
├── page.tsx         # Ana sayfa
├── products/        # Ürün listesi ve detay
├── categories/      # Kategori sayfaları
├── cart/            # Sepet
├── about/           # Hakkımızda
└── contact/         # İletişim
```

## Kurulum

```bash
npm install
npm run dev
```

Site `http://localhost:3000` adresinde çalışır.

## Marka Renkleri

- **Navy Blue:** `#00337C`
- **Silver:** `#A6A9AA`
