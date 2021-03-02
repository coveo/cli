node('linux && docker') {
  checkout scm

  withDockerContainer(image: 'node:14', args: '-u=root') {

    stage('Setup') {
      sh 'npm i'
    }

    stage('Download release assets') {
      withCredentials([
        string(credentialsId: '	github-coveobot_token', variable: 'GITHUB_CREDENTIALS')
      ]) {
        sh 'node ./scripts/download-release-assets.js'
      }
    }
  }

  withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {
    stage('Create package') {
      sh "deployment-package package create --artifacts-location ./artifacts/ --with-deploy"
    }
  }
}
