# Weather-APP Docker Image CI/CD Pipeline

## Opis zadania

Celem zadania było stworzenie pipeline'u w GitHub Actions który:
- zbuduje obraz Docker na podstawie Dockerifle i źródeł aplikacji z zadania nr 1 (repozytorium weather-app)
- obsługuje dwie architektury: `linux/amd64` i `linux/arm64`
- wykorzysta dane cache (eksporter: registry oraz backend registry w trybie max)
- wykonuje test CVE obrazu który zapewni ze obraz zostanie przesłany do publicznego repozytorium obrazów na GitHub tylko wtedy gdy nie będzie zawierał zagrożeń sklasyfikowanych jako krytyczne lub wysokie

## Szczegóły implementacji

### SSH Agent
W workflow wykorzystano krok dla załadowania klucza SSH do agenta SSH w środowisku GHActions ponieważ obraz z zadania nr 1 wymagał dostepu do repozytoriów przez dostęp SSH.

### Budowanie obrazu

- Obraz budowany jest lokalnie dla architektury linux/amd64 i ładowany do lokalnego dockera (`z load:true`) pod tagiem `local-weather-app:scan`
- Cache jest wykorzystywany z publicznego repozytorium DockerHub
- Do budowania używany jest docker buildx z QEMU

### Skan obrazu

- Do skanowania wykorzystano Trivy (aquaseciruty/trivy-action), który sprawdza obraz pod kątem podatności.
- Skrypt ustawia exit-code na 1 gdy wykryje podatność o poziomie `Critical` lub `High`

### Push do GHCR

- Po pomyślnym zeskanowaniu obraz jest przesyłany do ghcr.io
- Push odbywa sie dla dwóch platform `linux/amd64` i `linux/arm64`.
- Nazwa repozytorium w tagach jest konwertowana na małe litery, aby uniknąć błedów związanych z wielkością liter w tagach Docker.

### Cache

- Cache jest przechowywany i pobierany z publicznego repozytorium na DockerHub.
- Backend cache jest ustawiony w trybie max.

## Tagowanie obrazów

- Obrazy maja tagi w oparciu o:
    - SHA skrót commit-a z priorytetem 100
    - Semantyczna wersja z priorytetem 200
- Tag `latest` jest ustawiany dla najnowszej wersji
- Cache jest tagowany zawsze pod nazwą:
    `${DOCKERHUB_USERNAME}/weather-app-ci-cd:cache`

**Uzasadnienie:**
 - Tagowanie wg SHA pozwala na jednoznaczną identyfikacje konkretnej wersji obrazu.
 - Semver umożliwia łatwe śledzenie i korzystanie z wersji produkcyjnych.
 - Wybór Trivy jako skanera wynika z prostoty integracji i szerokiego wsparcia.

## Set up
Aby pobrać i uruchomić kontener należy wykonać następujące komendy:
 - docker pull ghcr.io/wintryquip/weather-app-ci-cd:latest
 - docker run -p 3000:3000 -e API_KEY=YOUR_API_KEY  ghcr.io/wintryquip/weather-app-ci-cd:latest
