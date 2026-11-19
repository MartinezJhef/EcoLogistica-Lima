import React from 'react';
import {it,expect,vi} from 'vitest';
import {render,screen,fireEvent} from '@testing-library/react';
import {Pagination} from './Pagination';
it('permite cambiar página y desactiva las flechas en ambos extremos',()=>{
  const change=vi.fn();
  const {rerender}=render(<Pagination page={1} totalPages={8} totalItems={96} from={1} to={12} onChange={change}/>);
  expect(screen.getByLabelText('Página anterior')).toBeDisabled();
  fireEvent.click(screen.getByLabelText('Página siguiente'));expect(change).toHaveBeenLastCalledWith(2);
  fireEvent.click(screen.getByLabelText('Ir a la página 4'));expect(change).toHaveBeenLastCalledWith(4);
  rerender(<Pagination page={8} totalPages={8} totalItems={96} from={85} to={96} onChange={change}/>);
  expect(screen.getByLabelText('Página siguiente')).toBeDisabled();
  fireEvent.click(screen.getByLabelText('Página anterior'));expect(change).toHaveBeenLastCalledWith(7);
  expect(screen.getByLabelText('Ir a la página 8')).toHaveAttribute('aria-current','page');
});
