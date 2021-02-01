node('linux && docker') {
  checkout scm
  def isMaster = env.BRANCH_NAME == 'master'

  withEnv(['npm_config_cache=npm-cache', 'CI=true']) {
    withDockerContainer(image: 'node:14', args: '-u=root') {

      stage('Setup') {
        sh 'apt update'
        sh 'apt-get -y install libsecret-1-dev'
        sh 'npm run setup'
      }

      stage('Test') {
        sh 'npm run test'
      }

      stage('Build') {
        sh 'echo TODO BUILD'
      }
    }
  }

  if (!isMaster) {
    return
  }

  withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {

    stage('Deployment pipeline upload') {
      sh "deployment-package package create --with-deploy"
    }
  }
}
