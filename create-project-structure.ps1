# Script PowerShell pour créer la structure de projet de l'application de diagrammes Gantt et PERT
# Auteur: Fox
# Date: 12/05/2025

# Fonction pour créer des répertoires et des fichiers vides
function Create-EmptyFile {
    param (
        [string]$path
    )

    # Créer le répertoire parent si nécessaire
    $directory = Split-Path -Path $path -Parent
    if (!(Test-Path -Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    # Créer le fichier vide
    New-Item -ItemType File -Path $path -Force | Out-Null
    Write-Host "Fichier créé: $path" -ForegroundColor Green
}

Write-Host "Création de la structure de projet pour l'application de diagrammes Gantt et PERT..." -ForegroundColor Cyan

# Création des répertoires principaux
$directories = @(
    "src/assets/fonts",
    "src/assets/images",
    "src/assets/icons",
    "src/components/layout",
    "src/components/common",
    "src/components/gantt",
    "src/components/pert",
    "src/contexts",
    "src/hooks",
    "src/models",
    "src/pages",
    "src/services/localStorage",
    "src/services/chart",
    "src/services/export",
    "src/services/algorithm",
    "src/utils"
)

foreach ($dir in $directories) {
    if (!(Test-Path -Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Répertoire créé: $dir" -ForegroundColor Yellow
    }
}

# Création des fichiers dans assets
Create-EmptyFile -path "src/assets/images/logo.svg"
Create-EmptyFile -path "src/assets/icons/index.ts"

# Création des fichiers de composants layout
Create-EmptyFile -path "src/components/layout/Header.tsx"
Create-EmptyFile -path "src/components/layout/Sidebar.tsx"
Create-EmptyFile -path "src/components/layout/Footer.tsx"
Create-EmptyFile -path "src/components/layout/Layout.tsx"

# Création des fichiers de composants communs
Create-EmptyFile -path "src/components/common/Button.tsx"
Create-EmptyFile -path "src/components/common/Card.tsx"
Create-EmptyFile -path "src/components/common/Modal.tsx"
Create-EmptyFile -path "src/components/common/Toast.tsx"

# Création des fichiers de composants Gantt
Create-EmptyFile -path "src/components/gantt/GanttChart.tsx"
Create-EmptyFile -path "src/components/gantt/GanttTask.tsx"
Create-EmptyFile -path "src/components/gantt/GanttTimeline.tsx"
Create-EmptyFile -path "src/components/gantt/GanttToolbar.tsx"

# Création des fichiers de composants PERT
Create-EmptyFile -path "src/components/pert/PertChart.tsx"
Create-EmptyFile -path "src/components/pert/PertNode.tsx"
Create-EmptyFile -path "src/components/pert/PertEdge.tsx"
Create-EmptyFile -path "src/components/pert/PertToolbar.tsx"

# Création des fichiers de contextes
Create-EmptyFile -path "src/contexts/ThemeContext.tsx"
Create-EmptyFile -path "src/contexts/ProjectContext.tsx"

# Création des fichiers de hooks
Create-EmptyFile -path "src/hooks/useLocalStorage.ts"
Create-EmptyFile -path "src/hooks/useProject.ts"
Create-EmptyFile -path "src/hooks/useTasks.ts"

# Création des fichiers de modèles
Create-EmptyFile -path "src/models/Task.ts"
Create-EmptyFile -path "src/models/Project.ts"
Create-EmptyFile -path "src/models/types.ts"

# Création des fichiers de pages
Create-EmptyFile -path "src/pages/Landing.tsx"
Create-EmptyFile -path "src/pages/Dashboard.tsx"
Create-EmptyFile -path "src/pages/GanttPage.tsx"
Create-EmptyFile -path "src/pages/PertPage.tsx"
Create-EmptyFile -path "src/pages/ProjectSettings.tsx"
Create-EmptyFile -path "src/pages/NotFound.tsx"

# Création des fichiers de services
Create-EmptyFile -path "src/services/localStorage/localStorageService.ts"
Create-EmptyFile -path "src/services/localStorage/projectStorage.ts"
Create-EmptyFile -path "src/services/chart/ganttService.ts"
Create-EmptyFile -path "src/services/chart/pertService.ts"
Create-EmptyFile -path "src/services/export/imageExport.ts"
Create-EmptyFile -path "src/services/export/dataExport.ts"
Create-EmptyFile -path "src/services/algorithm/criticalPath.ts"
Create-EmptyFile -path "src/services/algorithm/schedulingAlgorithm.ts"

# Création des fichiers utilitaires
Create-EmptyFile -path "src/utils/dateUtils.ts"
Create-EmptyFile -path "src/utils/chartUtils.ts"
Create-EmptyFile -path "src/utils/uiUtils.ts"

Write-Host "Structure de projet créée avec succès!" -ForegroundColor Green
Write-Host "Vous pouvez maintenant commencer à développer votre application." -ForegroundColor Cyan