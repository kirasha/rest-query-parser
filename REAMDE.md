Give me the username, email and name of all users with age between 20 and 30 whose name contains john
https://server.com/api/user?fields=username,email,name&filters=name~=john,age<20-30>&embed=role
Give me 10 users sorted by creation date on page 5
https://server.com/api/user?page=5&size=10&sort=-email
https://server.com/api/user?pagination[page]=5&pagination[size]=10&sorting[email]='asc'&&sorting[name]='desc'
