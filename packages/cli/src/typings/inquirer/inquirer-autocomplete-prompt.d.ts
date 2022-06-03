import inquirer from 'inquirer';

declare module 'inquirer' {
  interface AutoCompleteListQuestion<T extends Answers = Answers>
    extends ListQuestionOptions<T> {
    type: 'autocomplete';
    source?(answersSoFar: string, input: string): FilterResult<string>[];
  }

  interface QuestionMap<T extends Answers = Answers> {
    autocomplete: AutoCompleteListQuestion<T>;
  }
}
