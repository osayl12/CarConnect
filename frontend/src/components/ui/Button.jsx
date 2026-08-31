import { buttonClass } from './buttonClass';

export default function Button({ variant = 'primary', className = '', ...props }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}
