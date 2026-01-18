import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator as CalcIcon, Delete } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

export default function Calculadora() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? currentValue / inputValue : 'Erro';
          break;
        case '%':
          result = currentValue % inputValue;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result;

    switch (operation) {
      case '+':
        result = previousValue + inputValue;
        break;
      case '-':
        result = previousValue - inputValue;
        break;
      case '×':
        result = previousValue * inputValue;
        break;
      case '÷':
        result = inputValue !== 0 ? previousValue / inputValue : 'Erro';
        break;
      case '%':
        result = previousValue % inputValue;
        break;
      default:
        result = inputValue;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const formatDisplay = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (value.includes('.') && value.endsWith('0') && !waitingForOperand) return value;
    if (value.endsWith('.')) return value;
    return num.toLocaleString('pt-BR', { maximumFractionDigits: 10 });
  };

  const buttonClass = "h-14 text-lg font-medium rounded-xl transition-all active:scale-95";
  const numberClass = `${buttonClass} bg-slate-100 hover:bg-slate-200 text-slate-800`;
  const operatorClass = `${buttonClass} bg-blue-500 hover:bg-blue-600 text-white`;
  const specialClass = `${buttonClass} bg-slate-200 hover:bg-slate-300 text-slate-700`;

  return (
    <div>
      <PageHeader
        title="Calculadora"
        subtitle="Calculadora simples para operações básicas"
      />

      <div className="max-w-sm mx-auto">
        <Card className="p-6 border-0 shadow-xl bg-white">
          {/* Display */}
          <div className="mb-4 p-4 rounded-xl bg-slate-900 text-right">
            <div className="text-slate-400 text-sm h-5">
              {previousValue !== null && `${previousValue} ${operation || ''}`}
            </div>
            <div className="text-white text-3xl font-bold truncate">
              {formatDisplay(display)}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button className={specialClass} onClick={clear}>C</Button>
            <Button className={specialClass} onClick={backspace}>
              <Delete className="w-5 h-5" />
            </Button>
            <Button className={specialClass} onClick={() => performOperation('%')}>%</Button>
            <Button className={operatorClass} onClick={() => performOperation('÷')}>÷</Button>

            <Button className={numberClass} onClick={() => inputDigit('7')}>7</Button>
            <Button className={numberClass} onClick={() => inputDigit('8')}>8</Button>
            <Button className={numberClass} onClick={() => inputDigit('9')}>9</Button>
            <Button className={operatorClass} onClick={() => performOperation('×')}>×</Button>

            <Button className={numberClass} onClick={() => inputDigit('4')}>4</Button>
            <Button className={numberClass} onClick={() => inputDigit('5')}>5</Button>
            <Button className={numberClass} onClick={() => inputDigit('6')}>6</Button>
            <Button className={operatorClass} onClick={() => performOperation('-')}>−</Button>

            <Button className={numberClass} onClick={() => inputDigit('1')}>1</Button>
            <Button className={numberClass} onClick={() => inputDigit('2')}>2</Button>
            <Button className={numberClass} onClick={() => inputDigit('3')}>3</Button>
            <Button className={operatorClass} onClick={() => performOperation('+')}>+</Button>

            <Button className={`${numberClass} col-span-2`} onClick={() => inputDigit('0')}>0</Button>
            <Button className={numberClass} onClick={inputDecimal}>,</Button>
            <Button 
              className={`${buttonClass} bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white`}
              onClick={calculate}
            >
              =
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}