import css from './Button.module.css'

const Button = ({ children, ...props }) => {
  return (
    <button {...props} className={css.button}>
      {children}
    </button>
  )
}

export default Button
