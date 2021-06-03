import {GetStaticProps} from "next";
import { IOperator } from "../interfaces/interface";
import Link from 'next/link';
import styles from '../styles/main.module.css';

interface OperatorsPageProps {
  operators: IOperator[]
}

const Index = ({operators}: OperatorsPageProps) => {
  return (
      <div className={styles.box}>
        <h2>Список операторов для оплаты</h2>
        <ul>
          {
            operators.map((item) => {
                  return <Link href={`/payment/${item.id}`} key={item.id}>
                    <li><img
                        src={item.src}/><span>{item.name}</span>
                    </li>
                  </Link>
                }
            )
          }
        </ul>
      </div>
  );
};

export default Index;

export const getStaticProps: GetStaticProps = async (context) => {
  const response = await fetch(`${process.env.API_URL}/operators`)
  const operators: IOperator[] = await response.json()
  return {
    props: {operators}
  }
}