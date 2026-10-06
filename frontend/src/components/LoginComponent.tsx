
import { useAuth } from '../context/AuthContext';
import { Box, Paper, TextField, Button, Typography} from '@mui/material';

import LightModeToggleButton from './LightModeToggleComponent';

export default function LoginForm(){
    const {login} = useAuth();
    //const [username, setUsername] = useState('');
    //const [password, setPassword] = useState('');
    
    /*
    const handleSubmit = async (event) => {

    }
    */

    async function executeLogin(formData: FormData){
        let username = formData.get("username") as string
        let password = formData.get("password") as string
        try{
            await login({username, password})
        } catch (ex){
            console.log("Incorrect Username or password")
        }
        
    }

    return (
        <Box sx={{backgroundColor:"background.default", height:"100vh",paddingBottom:"20px", display: 'flex', justifyContent: 'center', alignItems:"center", flexDirection:"column"}}>
            <Paper sx={{backgroundColor:"background.default",padding:"20px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}} component={"form"} action={(formData: FormData)=>executeLogin(formData)}>
                <LightModeToggleButton/>
                <Typography sx={{margin:0}} variant="h1" gutterBottom>AgriCore</Typography>
                <TextField 
                    name = "username"
                    label="Username"
                    fullWidth
                    margin='normal'
                />
                <TextField 
                    name = "password"
                    label = "Password"
                    type="password"
                    fullWidth
                    margin = 'normal'
                />

                <Button type = "submit" variant="contained" fullWidth sx={{mt:2}}>
                    Log In
                </Button>
                
            </Paper>

        </Box>
    )

}