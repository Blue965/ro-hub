import Highlight, { defaultProps } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/vsDark'

export default function CodeViewer({ code, language = 'lua' }: { code: string; language?: string }) {
  return (
    <div className="rounded shadow overflow-auto">
      <Highlight {...defaultProps} code={code} language={language} theme={theme}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className + ' p-4'} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
