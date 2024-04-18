import express, { Request, Response, NextFunction } from 'express';
import DbTool from './utils/dbTool'; // 导入DbTool类
import session from 'express-session';
import userRouter from './routes/user'; // 导入user路由
import imageRouter from './routes/image';
import responseWrapper from "./middlewares/responseWrapper";
import dotenv from "dotenv"; // 导入image路由
import ConnectSessionSequelize from 'connect-session-sequelize';
import path from "path";
import contact from "./routes/contact";

const port = 3000;
const app = express();
const dbTool = new DbTool(); // 创建DbTool实例
const SequelizeStore = ConnectSessionSequelize(session.Store);

// 设定静态文件目录
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));


app.use('/uploads', express.static('uploads'));

app.use(express.json());
app.use(session({
  store: new SequelizeStore({
    db: dbTool.sequelize
  }),
  secret: 'sXVb2nC4cY3dA5fQ7jW98E7lR0mN5yU2',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // 如果你在生产环境中使用，应该设置为 true
}));

app.use(responseWrapper); // 使用响应包装器中间件


// Your routes go here
// For example, you might have a users route like this:
// import usersRouter from './routes/users';
// app.use('/users', usersRouter);
app.use('/api/user', userRouter);
app.use('/api/picture-card', imageRouter);
app.use('/api/contact',contact);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Not Found' });
});
// 所有路由请求都返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
  await dbTool.connect(); // 在应用启动时连接到数据库
})

export default app;