# Türklük ve Türk Şuuru - Modern Blog Sitesi

Türk kültürü, dili ve kimliği hakkında modern tasarma sahip, statik bir blog sitesidir. Bu proje GitHub'da paylaşılmaya ve Vercel üzerinde yayınlanmaya hazır hale getirilmiştir.

## 📋 İçerik

- **Anasayfa**: Blog yazılarının listesi ve site hakkında bilgiler
- **Kültür ve Dil Farkındalığı**: Türk dilinin ve kültürünün korunması hakkında yazı
- **Türk Nedir?**: Türk kimliğinin tanımı ve modern dönemde Türklük hakkında yazı

## 🎨 Özellikler

- ✅ Modern, duyarlı (responsive) tasarım
- ✅ SEO uyumlu URL yapıları
- ✅ Vercel ile tek tıkla canlıya alma desteği
- ✅ Koyu tema ve profesyonel renk şeması
- ✅ Hızlı yükleme - optimize edilmiş statik dosyalar

## 📁 Dosya Yapısı

```
BlogSite/
├── index.html                           # Ana sayfa
├── kultur-ve-dil-farkindaligi.html      # Blog yazısı 1
├── turk-kimligi.html                    # Blog yazısı 2
├── assets/                              # Statik varlıklar
│   ├── styles.css                       # CSS dosyası
│   └── script.js                        # JavaScript dosyası
├── vercel.json                          # Vercel yapılandırması (Clean URLs)
└── README.md                            # Bu dosya
```

## 🚀 Yayınlama (Deployment)

### GitHub'a Yükleme
1. GitHub üzerinde yeni bir repository oluşturun.
2. Yerel klasörünüzde terminali açın:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/kullaniciadi/repository-adi.git
   git push -u origin main
   ```

### Vercel'de Yayınlama
1. [Vercel](https://vercel.com) hesabınıza giriş yapın.
2. **"Add New"** > **"Project"** butonuna tıklayın.
3. GitHub repository'nizi seçin.
4. Ayarları varsayılan bırakarak **"Deploy"** butonuna basın.

Site otomatik olarak `https://proje-adi.vercel.app` adresinde yayınlanacaktır.

## 🛠 Geliştirme

Lokalde görüntülemek için herhangi bir web tarayıcısında `index.html` dosyasını açmanız yeterlidir. Daha iyi bir deneyim (ve `vercel.json` kurallarını test etmek) için:

```bash
# Vercel CLI yüklü ise
vercel dev
```

## 📄 Lisans

© 2026 Türklük ve Türk Şuuru. Tüm hakları saklıdır.
