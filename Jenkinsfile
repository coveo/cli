node('linux && docker') {
  checkout scm

  withDockerContainer(image: 'node:14', args: '-u=root') {

    stage('Download release assets') {
      withCredentials([
        usernameColonPassword(credentialsId: '	github-coveobot_token', variable: 'GITHUB_CREDENTIALS')
      ]) {
        sh 'node script/download-release-assets.js'
      }
    }
  }

   withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {
     sh "deployment-package package create --artifacts-location ./artifacts/ --with-deploy"
   }
}