node('linux && docker') {
  checkout scm
  def releaseCommit

  withDockerContainer(image: 'node:16', args: '-u=root') {

    stage('Setup') {
      sh 'npm ci --ignore-scripts'
    }

    stage('Download release assets') {
      withCredentials([
        string(credentialsId: '	github-coveobot_token', variable: 'GITHUB_CREDENTIALS')
      ]) {
        sh 'node ./scripts/get-release-artifact-and-commit-sha.js'
        releaseCommit = readFile 'latest-commit'
      }
    }
  }

  withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {
    stage('Create package') {
      sh "deployment-package package create --artifacts-location ./artifacts/ --with-deploy --changeset ${releaseCommit}"
    }
  }
}
