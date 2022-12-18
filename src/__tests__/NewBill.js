/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, wait, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { ROUTES_PATH } from '../constants/routes.js';
import mockStore from '../__mocks__/store';
import { bills } from '../fixtures/bills.js';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import router from '../app/Router.js';

jest.mock('../app/Store', () => mockStore);

describe('Given I am connected as an employee', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
      })
    );
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.NewBill);
  });
  describe('When I am on NewBill Page', () => {
    test('Then email icon in vertical layout should be highlighted', async () => {
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      expect(mailIcon.classList.contains('active-icon')).toBeTruthy();
    });
    describe('When I select a new bill file', () => {
      test("Then it throws an alert message if the format of the file format isn't correct", async () => {
        const fileToUpload = new File(['Hello'], 'chucknorris.pdf', {
          type: 'application/pdf',
        });
        await waitFor(() => screen.getByTestId('file'));
        const fileInput = screen.getByTestId('file');
        await waitFor(() => userEvent.upload(fileInput, fileToUpload));
        const file = fileInput.files[0];
        expect(file).toBeUndefined();
      });
      test("Then it throws an alert message if the file hasn't any format", async () => {
        const fileToUpload = new File(['Hello'], 'chucknorris', {
          type: 'text/plain',
        });
        await waitFor(() => screen.getByTestId('file'));
        const fileInput = screen.getByTestId('file');
        await waitFor(() => userEvent.upload(fileInput, fileToUpload));
        const file = fileInput.files[0];
        expect(file).toBeUndefined();
      });
      test('Then the file is successfully loaded if the format of the file is correct', async () => {
        const fileToUpload = new File(['(⌐□_□)'], 'chucknorris.png', {
          type: 'image/png',
        });

        await waitFor(() => screen.getByTestId('file'));
        const fileInput = screen.getByTestId('file');

        await waitFor(() => userEvent.upload(fileInput, fileToUpload));

        const file = fileInput.files[0];
        expect(file).toBe(fileToUpload);
      });
    });
    describe('When I submit the Bill Form', () => {
      afterEach(() => {
        window.onNavigate(ROUTES_PATH.NewBill);
      });
      test('Then it should redirect to the Bills page', async () => {
        const fileToUpload = new File(['(⌐□_□)'], 'chucknorris.png', {
          type: 'image/png',
        });

        await waitFor(() => screen.getByTestId('file'));
        const fileInput = screen.getByTestId('file');
        await waitFor(() => userEvent.upload(fileInput, fileToUpload));

        await waitFor(() => screen.getByTestId('form-new-bill'));
        let billForm = screen.getByTestId('form-new-bill');
        expect(billForm).toBeTruthy();

        const expenseType = screen.getByTestId('expense-type');
        const expenseName = screen.getByTestId('expense-name');
        const datepicker = screen.getByTestId('datepicker');
        const amount = screen.getByTestId('amount');
        const vat = screen.getByTestId('vat');
        const pct = screen.getByTestId('pct');
        const commentary = screen.getByTestId('commentary');
        const sendBillBtn = billForm.querySelector('.btn.btn-primary');

        expenseType.value = 'Transports';
        expenseName.value = 'test';
        datepicker.value = '2022-10-01';
        amount.value = '20';
        vat.value = '5';
        pct.value = '15';
        commentary.value = 'Hello everyone';
        await waitFor(() => userEvent.click(sendBillBtn));
        await new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, 200);
        });

        billForm = document.querySelector('form[data-testid="form-new-bill"]');

        expect(billForm).toBeNull();

        const billsTable = screen.getByTestId('bills-table');
        expect(billsTable).toBeTruthy();
      });
    });
  });
});
