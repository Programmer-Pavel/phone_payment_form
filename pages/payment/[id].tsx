import React, {useState} from 'react';
import {useFormik} from 'formik';
import * as yup from 'yup';
import Button from '@material-ui/core/Button';
import {Avatar, Card, Divider, FormHelperText, makeStyles, OutlinedInput, withStyles} from "@material-ui/core";
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import {useRouter} from "next/router";
import axios from "axios";
import {Alert, AlertTitle} from "@material-ui/lab";
import {GetServerSideProps} from "next";
import { IOperator } from '../../interfaces/interface';
import MaskedInput from 'react-text-mask';


const useStyles = makeStyles((theme) => ({
    container: {
        width: '400px',
        height: '400px'
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        margin: '10px'
    },
    box: {
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
    },
}))

const StyledInput = withStyles({
    root: {
        marginTop: 10,
        marginBottom: 20,
    },
})(FormControl);

const validationSchema = yup.object({
    phoneNumber: yup
        .string()
        .required('Телефон обязателен')
        .matches(/^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/, {message: "пожалуйста, введите действительный номер.", excludeEmptyString: false}),
    sum: yup
        .number()
        .min(1, 'Сумма должна быть больше или равна 1')
        .max(1000, 'Сумма должна быть меньше или равна 1000')
        .required('Сумма обязательна'),
});

function PhoneMask(props: { inputRef: any; }) {
    const {inputRef, ...other} = props;

    return (
        <MaskedInput
            {...other}
            ref={(ref: { inputElement: any; }) => {
                inputRef(ref ? ref.inputElement : null);
            }}
            mask={['+', '7', '(', /\d/, /\d/, /\d/, ')', '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
            placeholderChar={'\u2000'}
        />
    );
};

interface OperatorPageProps {
    operator: IOperator
}

const Payment = ({operator}: OperatorPageProps) => {

    const classes = useStyles();
    const {query} = useRouter()
    const router = useRouter()
    const [paymentSuccess, setPaymentSuccess] = useState<boolean>();
    const [paymentError, setPaymentError] = useState<boolean>();

    const transitionToMain = () => {
        router.push('/')
    }

    const formik = useFormik({
        initialValues: {
            sum: '',
            phoneNumber: ''
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                await axios.patch(`${process.env.API_URL}/operators/${query.id}`, {
                    payment: {
                        phoneNumber: values.phoneNumber,
                        sum: values.sum
                    }
                })
                setPaymentSuccess(true)
                setTimeout(() => {
                    transitionToMain()
                }, 2000)
            } catch (e) {
                setPaymentError(true)
                setTimeout(() => {
                    setPaymentError(false)
                }, 5000)
            }
        }
    })

    return (
        <Card className={classes.container}>
            {paymentError ?
                <Alert severity="error">
                    <AlertTitle>Ошибка при оплате!</AlertTitle>
                </Alert> : null
            }
            {paymentSuccess ?
                <Alert severity="success">
                    <AlertTitle>Успешно оплачено!</AlertTitle>
                </Alert> : null
            }
            <Button variant="contained" onClick={transitionToMain}>Назад</Button>
            <div className={classes.header}>
                <Avatar src={operator.src}/>
                <h2>{operator.name}</h2>
            </div>
            <Divider/>
            <form onSubmit={formik.handleSubmit} className={classes.box}>
                <StyledInput variant="outlined">
                    <InputLabel htmlFor="phoneNumber">Телефон</InputLabel>
                    <OutlinedInput
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        name="phoneNumber"
                        id="phoneNumber"
                        inputComponent={PhoneMask}
                        error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                    />
                    <FormHelperText
                        id="component-error-text">{formik.touched.phoneNumber && formik.errors.phoneNumber}</FormHelperText>
                </StyledInput>
                <StyledInput variant="outlined">
                    <InputLabel htmlFor="sum">Сумма</InputLabel>
                    <OutlinedInput
                        value={formik.values.sum}
                        onChange={formik.handleChange}
                        type="number"
                        id="sum"
                        name="sum"
                        error={formik.touched.sum && Boolean(formik.errors.sum)}
                    />
                    <FormHelperText id="component-error-text">{formik.touched.sum && formik.errors.sum}</FormHelperText>
                </StyledInput>
                <Button variant="contained" type="submit" color="primary">
                    Оплатить
                </Button>
            </form>
        </Card>
    );
};
export default Payment;

export const getServerSideProps: GetServerSideProps = async ({params}) => {
    const response = await fetch(`${process.env.API_URL}/operators/${params.id}`)
    const operator: IOperator = await response.json()
    return {
        props: {operator},
    }
}
