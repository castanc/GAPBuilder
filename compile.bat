call cls
call tsc >errors.txt
call ren *.json *.tson
call del *.js /S/Q 
call ren *.tson *.json 
