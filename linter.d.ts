import Browserslist from './index.d'

declare namespace linter {
  interface Problem {
    id: string
    message: string
  }

  function lint(
    browserslist: typeof Browserslist,
    queries: string | readonly string[],
    opts?: Browserslist.Options
  ): Problem[]

  function formatReport(problems: Problem[]): string
}

export = linter
