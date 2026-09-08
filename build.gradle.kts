plugins {
  kotlin("multiplatform") version "2.4.20"
}

repositories {
    mavenCentral()
    maven("https://maven.pkg.jetbrains.space/public/p/kotlinx-html/maven")
}

dependencies {

}

kotlin {
    js {
        binaries.executable()
        browser {
            commonWebpackConfig {
              cssSupport {
                enabled.set(true)
              }
            }
        }
    }
    sourceSets {
            val jsMain by getting {
                kotlin.srcDir("src/main/kotlin")
                resources.srcDir("src/main/resources")
            }
    }
}