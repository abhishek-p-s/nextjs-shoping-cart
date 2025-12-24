import {cn} from '@/lib/utils';

const ProductPrice = ({value, className}:{value:string, className?:string}) => {

  const stringValue = value

  const [intValue, floatValue] = stringValue.split('.');

  return ( <p className={cn('text-2xl', className)}>
    <span className="text-xs align-super">$</span>
    {intValue}
    <span className="text-xs align-super">.{floatValue}</span>
  </p> );
}
 
export default ProductPrice;