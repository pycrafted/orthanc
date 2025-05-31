# Guide de migration : Reprendre le style et le JavaScript de ce portfolio React dans un projet Django

## 1. Objectif
Adapter le design, les interactions et l'ambiance visuelle de ce portfolio React (avec Tailwind CSS, animations, effets JS) dans un projet Django classique (HTML, Tailwind, JS vanilla/Alpine.js).

---

## 2. Palette de couleurs (depuis `tailwind.config.js`)

```js
primary:        #8A2BE2 (violet principal)
primary.dark:   #6A1CB2
primary.light:  #9D4EFF
secondary:      #FF00FF (magenta)
secondary.dark: #CC00CC
secondary.light:#FF33FF
neon.green:     #39FF14
neon.blue:      #00FFFF
neon.pink:      #FF10F0
neon.purple:    #B026FF
neon.yellow:    #FFFF00
dark:           #121212 (fond sombre)
dark.lighter:   #1E1E1E
dark.light:     #2C2C2C
light:          #F8F9FA (fond clair)
light.dark:     #E0E0E0
light.darker:   #CFCFCF
text.light:     #000000
text.dark:      #FFFFFF
```

---

## 3. Polices utilisées
- **Share Tech Mono** (pour `.font-cyber`)
- **Rajdhani** (pour `.font-sans`)

Lien Google Fonts à ajouter dans le `<head>` de vos templates Django :
```html
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
```

---

## 4. Animations et keyframes personnalisées (à ajouter dans `tailwind.config.js` ou CSS)
- **glitch**
- **glow**
- **float**
- **matrix**
- **pulseNeon**

Voir la section `keyframes` et `animation` dans `tailwind.config.js` pour les détails.

---

## 5. Classes utilitaires et styles personnalisés (depuis `src/index.css`)
- `.neon-border`, `.neon-text`, `.glitch-effect`, `.matrix-bg`, `.btn-cyber`, `.card-cyber`...
- Scrollbar custom
- Variables CSS :root (pour les couleurs)

**Astuce :** Copiez le contenu de `src/index.css` dans un fichier CSS global de votre projet Django, après avoir installé Tailwind.

---

## 6. Assets à copier
- `public/favicon.svg`
- `public/Portfolio.png`, `public/Mon_profil_Portfolio.jpeg`, `public/CyberPunk.jpg`
- Tous les fichiers de `public/logos/` (SVG)

Placez-les dans le dossier `static/` de Django et adaptez les chemins dans vos templates.

---

## 7. Dépendances JavaScript et alternatives
- **GSAP** (`gsap`, `ScrollTrigger`) : pour les animations avancées (peut être utilisé en JS vanilla)
- **framer-motion** : animations React, à remplacer par GSAP ou CSS/JS vanilla
- **react-type-animation** : à remplacer par un script JS pour l'effet dactylo
- **lucide-react** : icônes SVG, utilisez [Lucide Icons CDN](https://lucide.dev/icons/) ou copiez les SVG
- **Sons** : effets audio via `new Audio(url).play()`

---

## 8. Exemple de conversion d'un composant React en template Django

### React (JSX)
```jsx
<Link to="/projects" className="btn-cyber group">
  <span className="relative z-10 flex items-center">
    Voir mes projets
    <Code className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
  </span>
</Link>
```

### Django (HTML + Tailwind)
```html
<a href="{% url 'projects' %}" class="btn-cyber group">
  <span class="relative z-10 flex items-center">
    Voir mes projets
    <!-- Insérer SVG Lucide ici -->
    <svg class="ml-2 group-hover:translate-x-1 transition-transform" width="18" height="18" ...>...</svg>
  </span>
</a>
```

---

## 9. Intégration de Tailwind CSS dans Django
1. Installer Tailwind avec [django-tailwind](https://django-tailwind.readthedocs.io/en/latest/)
2. Copier la config de `tailwind.config.js` (couleurs, animations, polices)
3. Ajouter vos classes custom dans un fichier CSS global
4. Compiler Tailwind (`python manage.py tailwind build`)

---

## 10. Intégration des scripts JS
- Pour les effets Matrix, loader, glitch, etc. : extraire le code JS des composants React et l'adapter en vanilla JS (voir `MatrixRain.tsx` pour l'effet Matrix)
- Pour les animations d'entrée/sortie : utiliser GSAP en JS vanilla ou des animations CSS
- Pour les sons :
```js
const audio = new Audio('URL_DU_SON');
audio.volume = 0.1;
audio.play();
```

---

## 11. Organisation recommandée dans Django
- `static/css/` : vos fichiers CSS (inclure index.css adapté)
- `static/js/` : vos scripts JS (Matrix, glitch, etc.)
- `static/img/` : tous les assets
- `templates/` : vos templates Django (HTML)

---

## 12. Conseils pour la migration
- **Remplacez les composants React par des blocs HTML + classes Tailwind**
- **Remplacez les props dynamiques par des variables Django (`{{ variable }}`)**
- **Pour les interactions, privilégiez Alpine.js ou du JS vanilla**
- **Testez chaque effet/animation au fur et à mesure**

---

## 13. Ressources utiles
- [Django + Tailwind](https://django-tailwind.readthedocs.io/en/latest/)
- [GSAP Docs](https://greensock.com/docs/)
- [Lucide Icons](https://lucide.dev/icons/)
- [Alpine.js](https://alpinejs.dev/)

---

## 14. Pour aller plus loin
Si tu veux des exemples précis de migration d'un composant ou d'un effet, copie/colle le code React ici et demande la version Django/HTML/JS vanilla ! 