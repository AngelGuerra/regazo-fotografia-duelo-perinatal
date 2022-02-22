# Regazo Fotografía

[![Netlify Status](https://api.netlify.com/api/v1/badges/45bca68f-6428-4b80-8ef7-763bf7c54c30/deploy-status)](https://app.netlify.com/sites/thirsty-shockley-4340a2/deploys)

> Fotografía de duelo perinatal en Cantabria.

## Desarrollo

- El proyecto está realizado con [11ty](https://www.11ty.dev/), un generador de sitios estáticos muy sencillo de utilizar.
- Para los estilos se ha utilizado [Tailwind CSS](https://tailwindcss.com/), una librería _utility-first_ que mola.
- Para el javascript - el menú principalmente - se ha utilizado [Alpine](https://github.com/alpinejs/alpine).
- Para el despliegue utiliza [Netlify](https://www.netlify.com/).

### Sí, sí... pero, ¿cómo se arranca?

```bash
# git clone ...
cd regazo-fotografia-duelo-perinatal
npm i
# Para generar por primera vez el styles.css, ejecutamos un build, luego ya no hará falta
npm run build
# Entorno de desarrollo
npm run start
```